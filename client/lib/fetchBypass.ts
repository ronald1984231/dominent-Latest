/**
 * Emergency fetch bypass utility for extreme third-party interference cases
 * This provides a completely isolated fetch mechanism that bypasses all hooks
 */

/**
 * Creates a completely isolated XMLHttpRequest that bypasses all window.fetch hooks
 */
export function bypassFetch(url: string, options: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
} = {}): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
}> {
  return new Promise((resolve, reject) => {
    // Create XMLHttpRequest in a way that third parties can't intercept
    const xhr = new XMLHttpRequest();
    
    const method = options.method || 'GET';
    
    try {
      xhr.open(method, url, true);
      
      // Set default headers
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      // Set custom headers
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }
      
      // Set timeout
      xhr.timeout = 15000; // 15 seconds
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          const response = {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            json: async () => {
              try {
                return JSON.parse(xhr.responseText);
              } catch (e) {
                throw new Error('Failed to parse JSON response');
              }
            },
            text: async () => xhr.responseText,
          };
          resolve(response);
        }
      };
      
      xhr.onerror = () => {
        reject(new Error(`Network error for ${url}`));
      };
      
      xhr.ontimeout = () => {
        reject(new Error(`Request timeout for ${url}`));
      };
      
      // Send the request
      xhr.send(options.body || null);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Safe JSON fetch using bypass mechanism
 */
export async function bypassFetchJson<T = any>(url: string, options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
} = {}): Promise<T> {
  const fetchOptions = {
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  };
  
  const response = await bypassFetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}
