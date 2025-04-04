/**
 * This utility implements request batching to prevent too many concurrent API requests
 * which can lead to browser resource limitations and ERR_INSUFFICIENT_RESOURCES errors.
 */

interface BatchedRequest<T> {
  url: string;
  options: RequestInit;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

class RequestBatcher {
  private queue: BatchedRequest<any>[] = [];
  private isProcessing: boolean = false;
  private maxConcurrent: number = 4; // Maximum concurrent requests
  private activeRequests: number = 0;
  private processingDelay: number = 50; // ms between batches

  constructor(maxConcurrent: number = 4, processingDelay: number = 50) {
    this.maxConcurrent = maxConcurrent;
    this.processingDelay = processingDelay;
  }

  /**
   * Add a request to the queue
   */
  public enqueue<T>(url: string, options: RequestInit = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        url,
        options,
        resolve,
        reject
      });

      // Start processing the queue if not already doing so
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the queue of requests in batches
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        // Process a batch of requests
        while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
          const request = this.queue.shift();
          if (request) {
            this.activeRequests++;
            this.executeRequest(request).finally(() => {
              this.activeRequests--;
            });
          }
        }

        // Wait for some requests to complete before processing more
        if (this.activeRequests >= this.maxConcurrent || this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.processingDelay));
        }
      }
    } finally {
      this.isProcessing = false;
      
      // Check if more requests were added while processing
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Execute a single request
   */
  private async executeRequest<T>(request: BatchedRequest<T>): Promise<void> {
    try {
      const response = await fetch(request.url, request.options);
      
      // Clone the response and convert to json or text as needed
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          typeof data === 'string' 
            ? data 
            : data.detail || data.message || `Request failed with status ${response.status}`
        );
      }

      request.resolve(data);
    } catch (error) {
      request.reject(error);
    }
  }

  /**
   * Clear the queue of pending requests
   */
  public clearQueue(): void {
    const error = new Error('Request cancelled');
    this.queue.forEach(request => request.reject(error));
    this.queue = [];
  }
}

// Export a singleton instance
const requestBatcher = new RequestBatcher();
export default requestBatcher; 