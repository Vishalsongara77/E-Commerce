import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <FiAlertTriangle className="text-red-600 text-2xl" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Something went wrong</h2>
            <p className="text-gray-600 text-center mb-4">
              We're sorry, but there was an error loading this page.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
            {this.props.showDetails && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg overflow-auto max-h-40 text-xs">
                <p className="font-semibold">Error details:</p>
                <p className="text-red-600">{this.state.error && this.state.error.toString()}</p>
                <p className="mt-2 text-gray-700">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;