# Makeshop-v2 Refactoring Plan

## 1. Service Layer Separation (Priority: HIGH)

### 1.1 Browser Service (Priority: HIGH) ✅
- [x] Create `browserService.ts`
  - Implement browser lifecycle management
  - Add browser pooling mechanism
  - Implement browser cleanup utilities
- [x] Create `puppeteerUtils.ts`
  - Extract Puppeteer-specific configurations
  - Implement page navigation utilities
  - Add screenshot and DOM manipulation helpers
- [x] Integrate with main application
  - Update main index.ts to use browser service
  - Replace direct Puppeteer calls with service methods
  - Implement browser pooling in download handlers

### 1.2 Download Service (Priority: HIGH)
- [ ] Create `downloadService.ts`
  - Implement download coordination logic
  - Add retry mechanism
  - Implement concurrent download management
- [ ] Create `imageDownloader.ts`
  - Extract image download logic
  - Implement file naming conventions
  - Add image validation
- [ ] Create `progressTracker.ts`
  - Implement progress tracking system
  - Add event emission for progress updates
  - Create progress calculation utilities

### 1.3 File Service (Priority: MEDIUM)
- [ ] Create `fileService.ts`
  - Implement file system operations
  - Add file validation
  - Implement file cleanup utilities
- [ ] Create `pathUtils.ts`
  - Implement path manipulation functions
  - Add path validation
  - Create path normalization utilities

### 1.4 IPC Handlers (Priority: HIGH)
- [ ] Create `downloadHandler.ts`
  - Implement download-related IPC handlers
  - Add error handling
  - Implement progress reporting
- [ ] Create `fileHandler.ts`
  - Implement file operation IPC handlers
  - Add permission checks
  - Implement error handling

## 2. Frontend Architecture Improvements (Priority: HIGH)

### 2.1 Screen Components (Priority: HIGH)
- [ ] Create Setup Screen Module
  - [ ] `SetupScreen.ts`
    - Implement main setup screen logic
    - Add form validation
    - Implement file selection
  - [ ] `setupUtils.ts`
    - Add setup-specific utilities
    - Implement validation helpers
  - [ ] `types.ts`
    - Define setup screen types
    - Add interface definitions

- [ ] Create Process Screen Module
  - [ ] `ProcessScreen.ts`
    - Implement progress display
    - Add cancellation handling
    - Implement status updates
  - [ ] `progressBar.ts`
    - Create reusable progress bar component
    - Add animation support
  - [ ] `types.ts`
    - Define process screen types
    - Add interface definitions

### 2.2 Shared Components (Priority: MEDIUM)
- [ ] Create Status Components
  - [ ] `StatusBar.ts`
    - Implement status display
    - Add error message handling
  - [ ] `ProgressBar.ts`
    - Create base progress bar component
    - Add customization options

### 2.3 Utilities (Priority: MEDIUM)
- [ ] Create Utility Modules
  - [ ] `statusUtils.ts`
    - Implement status message formatting
    - Add status type definitions
  - [ ] `validationUtils.ts`
    - Add input validation functions
    - Implement error message formatting

### 2.4 Types (Priority: MEDIUM)
- [ ] Create Type Definitions
  - [ ] `common.ts`
    - Define shared interfaces
    - Add common type definitions
  - [ ] `download.ts`
    - Define download-related types
    - Add progress tracking types

### 2.5 Constants (Priority: LOW)
- [ ] Create Constants
  - [ ] `messages.ts`
    - Define UI messages
    - Add error messages
  - [ ] `config.ts`
    - Define UI configuration
    - Add theme constants

## 3. Code Improvements (Priority: HIGH)

### 3.1 Browser Management (Priority: HIGH)
- [ ] Implement BrowserManager Class
  - [ ] Add singleton pattern
  - [ ] Implement browser pooling
  - [ ] Add cleanup mechanisms
  - [ ] Implement error handling

### 3.2 Download Management (Priority: HIGH)
- [ ] Implement DownloadManager Class
  - [ ] Add progress tracking
  - [ ] Implement concurrent downloads
  - [ ] Add retry mechanism
  - [ ] Implement error handling

### 3.3 Progress Tracking (Priority: MEDIUM)
- [ ] Implement ProgressTracker Class
  - [ ] Add event emission
  - [ ] Implement progress calculation
  - [ ] Add error handling

## 4. Type Improvements (Priority: MEDIUM)

### 4.1 Type Definitions (Priority: MEDIUM)
- [ ] Create Download Types
  - [ ] Define DownloadParams interface
  - [ ] Add ProgressData interface
  - [ ] Create DownloadStage enum

### 4.2 Type Safety (Priority: MEDIUM)
- [ ] Implement Type Guards
  - [ ] Add runtime type checking
  - [ ] Implement validation functions

## 5. Error Handling Improvements (Priority: HIGH)

### 5.1 Error Classes (Priority: HIGH)
- [ ] Create Custom Error Classes
  - [ ] Implement DownloadError
  - [ ] Add ErrorCode enum
  - [ ] Create error context types

### 5.2 Error Handling (Priority: HIGH)
- [ ] Implement Error Handlers
  - [ ] Add global error handler
  - [ ] Implement error logging
  - [ ] Add error recovery mechanisms

## 6. Configuration Management (Priority: MEDIUM)

### 6.1 Configuration System (Priority: MEDIUM)
- [ ] Create Configuration Module
  - [ ] Implement config object
  - [ ] Add environment variables
  - [ ] Create configuration validation

### 6.2 Configuration Types (Priority: LOW)
- [ ] Define Configuration Types
  - [ ] Add type definitions
  - [ ] Implement validation

## 7. Testing Structure (Priority: HIGH)

### 7.1 Unit Tests (Priority: HIGH)
- [ ] Create Service Tests
  - [ ] Add browser service tests
  - [ ] Implement download service tests
  - [ ] Add file service tests
- [ ] Create Utility Tests
  - [ ] Add path utility tests
  - [ ] Implement validation tests

### 7.2 Integration Tests (Priority: MEDIUM)
- [ ] Create Download Tests
  - [ ] Add full download flow tests
  - [ ] Implement error handling tests

### 7.3 E2E Tests (Priority: MEDIUM)
- [ ] Create Screen Tests
  - [ ] Add setup screen tests
  - [ ] Implement process screen tests

## Implementation Strategy

### Phase 1: Foundation (Week 1)
- Set up new directory structure
- Create base classes and interfaces
- Implement core services

### Phase 2: Core Features (Week 2)
- Implement browser management
- Add download functionality
- Create progress tracking

### Phase 3: Frontend (Week 3)
- Refactor screen components
- Implement shared components
- Add utility functions

### Phase 4: Testing (Week 4)
- Add unit tests
- Implement integration tests
- Create E2E tests

### Phase 5: Polish (Week 5)
- Add error handling
- Implement configuration
- Optimize performance

## Notes
- Each task should be completed with proper documentation
- All new code should include unit tests
- Follow TypeScript best practices
- Maintain backward compatibility during refactoring
- Regular code reviews should be conducted 