import { showStatus } from './statusUtils';
import { showProcessScreen, hideProcessScreen } from './processScreen';
import Papa from 'papaparse';
import { ImageUrl } from './types';

// Get Setup Screen Elements
const csvFileInput = document.getElementById('csvFile') as HTMLInputElement;
const productIdFieldContainer = document.getElementById('productIdFieldContainer') as HTMLDivElement;
const productIdField = document.getElementById('productIdField') as HTMLSelectElement;
const storagePathInput = document.getElementById('storagePath') as HTMLInputElement;
const browseButton = document.getElementById('browseButton') as HTMLButtonElement;
const shopDomainInput = document.getElementById('shopDomain') as HTMLInputElement;
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

async function setDefaultStoragePath() {
  const defaultPath = await window.electronAPI.getDefaultFolder();

  if (storagePathInput) {
    storagePathInput.value = defaultPath;
  }

  // When the "Browse" button is clicked, open the folder picker
  if (browseButton) {
    browseButton.addEventListener('click', async () => {
      const folderPath = await (window as any).electronAPI.selectFolder();
      if (folderPath && storagePathInput) {
        storagePathInput.value = folderPath;
      }
    });
  }
}

setDefaultStoragePath();

// Function to parse CSV headers with Shift JIS encoding
async function parseCSVHeaders(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(buffer);
        const decoder = new TextDecoder('shift-jis');
        const text = decoder.decode(uint8Array);

        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          preview: 1 // Only parse the first row for headers
        });

        if (result.errors.length > 0) {
          reject(new Error('Error parsing CSV headers: ' + result.errors[0].message));
          return;
        }

        const headers = result.meta.fields || [];
        resolve(headers);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsArrayBuffer(file);
  });
}

// Function to populate product ID field options
function populateProductIdField(headers: string[]) {
  if (!productIdField || !productIdFieldContainer) return;

  // Clear existing options except the first one
  while (productIdField.options.length > 1) {
    productIdField.remove(1);
  }

  // Add header options
  headers.forEach(header => {
    const option = document.createElement('option');
    option.value = header;
    option.textContent = header;
    productIdField.appendChild(option);
  });

  // Enable the select field and show the container
  productIdField.disabled = false;
  productIdFieldContainer.classList.remove('hidden');

  // Try to find and select '商品ID' by default
  const defaultOption = Array.from(productIdField.options).find(
    option => option.value === '商品ID'
  );
  if (defaultOption) {
    productIdField.value = defaultOption.value;
  }
}

// Handle CSV file selection
csvFileInput?.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file && statusDiv) {
    statusDiv.classList.add('hidden'); // Hide status on new selection

    try {
      const headers = await parseCSVHeaders(file);
      populateProductIdField(headers);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      showStatus('Error parsing CSV file. Please check the file format.', 'error');
      // Reset product ID field and hide it
      if (productIdField) {
        productIdField.innerHTML = '<option value="">Select a field</option>';
        productIdField.disabled = true;
      }
      if (productIdFieldContainer) {
        productIdFieldContainer.classList.add('hidden');
      }
    }
  } else {
    // If no file is selected, hide the product ID field
    if (productIdFieldContainer) {
      productIdFieldContainer.classList.add('hidden');
    }
  }
});

// Handle storage path selection
browseButton?.addEventListener('click', async () => {
  if (!storagePathInput || !statusDiv) return;
  try {
    const selectedPath = await (window as any).electronAPI.selectFolder();
    if (selectedPath) {
      storagePathInput.value = selectedPath;
      statusDiv.classList.add('hidden'); // Hide status on success
    }
  } catch (error) {
    showStatus('Error selecting storage path', 'error');
    console.error('Error selecting storage path:', error);
  }
});

// Function to extract domain name from URL
function extractDomainName(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('Error extracting domain name:', error);
    return 'unknown-domain';
  }
}

// Function to download images in parallel with progress tracking
async function downloadImagesInParallel(
  imageUrls: ImageUrl[],
  domainFolderPath: string
): Promise<{ successCount: number; failureCount: number; cancelled: boolean }> {
  const totalImages = imageUrls.length;
  let successCount = 0;
  let failureCount = 0;
  let processedCount = 0;
  let cancelled = false;

  // Create progress elements
  const progressBar = document.getElementById('downloadProgressBar') as HTMLProgressElement;
  const progressText = document.getElementById('progressStatusText') as HTMLDivElement;
  const cancelButton = document.getElementById('cancelProcessButton') as HTMLButtonElement;

  // Initialize progress
  if (progressBar) {
    progressBar.value = 0;
    progressBar.max = totalImages; // Set max to total number of images
  }
  if (progressText) {
    progressText.textContent = `${totalImages}の画像をダウンロード中...`;
  }
  if (statusDiv) {
    statusDiv.classList.remove('hidden');
    statusDiv.textContent = `画像のダウンロードを開始します...`;
  }

  // Set up cancellation handler
  if (cancelButton) {
    cancelButton.addEventListener('click', async () => {
      // Send cancellation request to main process
      await window.electronAPI.cancelDownload();

      // Update UI to show cancellation
      if (progressText) {
        progressText.textContent = 'ダウンロードがキャンセルされました';
      }
      if (statusDiv) {
        statusDiv.textContent = 'ダウンロードがキャンセルされました';
      }

      // Set cancelled flag
      cancelled = true;
    });
  }

  // Process all images in parallel
  const downloadPromises = imageUrls.map(async (imageUrl) => {
    // Check if download has been cancelled
    if (cancelled) {
      return false;
    }

    try {
      // Download the image
      const result = await window.electronAPI.downloadSingleImage({
        imageUrl,
        domainFolderPath,
      });

      // Update progress only if the download was successful
      if (result.success) {
        successCount++;
        processedCount++;

        // Simply increment the progress bar value by 1
        if (progressBar) progressBar.value = processedCount;

        if (progressText && !cancelled) {
          progressText.textContent = `画像のダウンロード中 (${processedCount}/${totalImages})`;
        }

        // Also update the status div if it exists
        if (statusDiv && !cancelled) {
          statusDiv.textContent = `画像のダウンロード中... ${processedCount}/${totalImages}`;
        }
      } else {
        failureCount++;
      }

      return result.success;
    } catch (error) {
      console.error(`Error downloading image for product ID ${imageUrl.productId}:`, error);
      failureCount++;
      return false;
    }
  });

  // Wait for all downloads to complete or until cancelled
  await Promise.all(downloadPromises);

  return { successCount, failureCount, cancelled };
}

// Function to reset form inputs after download
function resetFormAfterDownload() {
  // Clear CSV file input
  if (csvFileInput) {
    csvFileInput.value = '';
  }

  // Clear sample URL input
  if (shopDomainInput) {
    shopDomainInput.value = '';
  }

  // Reset product ID field
  if (productIdField) {
    productIdField.value = '';
    productIdField.disabled = true;
  }

  // Hide product ID field container
  if (productIdFieldContainer) {
    productIdFieldContainer.classList.add('hidden');
  }
}

// Handle start button click
startButton?.addEventListener('click', async () => {
  if (!csvFileInput || !storagePathInput || !shopDomainInput || !statusDiv || !productIdField) return;

  const csvFile = csvFileInput.files?.[0];
  const storagePath = storagePathInput.value;
  const sampleUrl = shopDomainInput.value;
  const selectedProductIdField = productIdField.value;

  // --- Input Validation ---
  if (!csvFile) {
    showStatus('CSVファイルを選択してください', 'error');
    return;
  }
  if (!selectedProductIdField) {
    showStatus('商品IDフィールドを選択してください', 'error');
    return;
  }
  if (!storagePath) {
    showStatus('保存先を選択してください', 'error');
    return;
  }
  if (!sampleUrl) {
    showStatus('サンプル商品URLを入力してください', 'error');
    return;
  }

  // Validate that the sample URL contains a 12-digit product ID
  if (!/\d{12}/.test(sampleUrl)) {
    showStatus('サンプル商品URLには12桁の商品IDが必要です', 'error');
    return;
  }

  // Hide any previous status messages before starting
  statusDiv.classList.add('hidden');

  // --- Show Process Screen ---
  showProcessScreen();

  try {
    // Parse CSV file with Shift JIS encoding
    const buffer = await csvFile.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const decoder = new TextDecoder('shift-jis');
    const csvText = decoder.decode(uint8Array);

    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    if (result.errors.length > 0) {
      throw new Error('Error parsing CSV: ' + result.errors[0].message);
    }

    // First stage: Check for images
    const checkResult = await window.electronAPI.checkImages({
      csvData: result.data,
      sampleUrl,
      selectedProductIdField,
      storagePath
    });

    if (!checkResult.success) {
      throw new Error(checkResult.message);
    }

    if (checkResult.imageUrls.length === 0) {
      throw new Error('No images found to download');
    }

    // Create domain folder
    const domainName = extractDomainName(sampleUrl);
    const domainFolderPath = await window.electronAPI.createDomainFolder({
      storagePath,
      domainName
    });

    // Second stage: Download images in parallel with progress tracking
    const { successCount, failureCount, cancelled } = await downloadImagesInParallel(
      checkResult.imageUrls,
      domainFolderPath
    );

    // Show final status
    if (cancelled) {
      showStatus(`ダウンロードがキャンセルされました。${successCount}の画像をダウンロードしました。`, 'success');
      setTimeout(() => {
        hideProcessScreen(false, `ダウンロードがキャンセルされました。${successCount}の画像をダウンロードしました。`);
        // Reset form inputs after cancellation
        resetFormAfterDownload();
      }, 2000);
    } else if (successCount === checkResult.imageUrls.length) {
      showStatus(`すべての${checkResult.imageUrls.length}の画像をダウンロードしました。商品ごとのフォルダに整理されています。`, 'success');
      setTimeout(() => {
        hideProcessScreen(false, `すべての${checkResult.imageUrls.length}の画像をダウンロードしました。商品ごとのフォルダに整理されています。`);
        // Reset form inputs after successful download
        resetFormAfterDownload();
      }, 2000);
    } else {
      showStatus(`${successCount}の画像をダウンロードしました。${failureCount}の画像をダウンロードに失敗しました。商品ごとのフォルダに整理されています。`, 'success');
      setTimeout(() => {
        hideProcessScreen(false, `${successCount}の画像をダウンロードしました。${failureCount}の画像をダウンロードに失敗しました。商品ごとのフォルダに整理されています。`);
        // Reset form inputs after download (even with some failures)
        resetFormAfterDownload();
      }, 2000);
    }

  } catch (error) {
    console.error('ダウンロードプロセスでエラーが発生しました:', error);
    showStatus('ダウンロードプロセスでエラーが発生しました: ' + (error instanceof Error ? error.message : '不明なエラー'), 'error');
    hideProcessScreen(true, 'ダウンロードプロセスでエラーが発生しました');
  }
});