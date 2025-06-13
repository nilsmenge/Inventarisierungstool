import '@testing-library/jest-dom'

// Mock für navigator.mediaDevices
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(),
}

// Mock für HTMLVideoElement
global.HTMLVideoElement.prototype.play = vi.fn(() => Promise.resolve())
global.HTMLVideoElement.prototype.pause = vi.fn()

// Mock für URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()