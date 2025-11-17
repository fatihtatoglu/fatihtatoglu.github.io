const MOCK_RESPONSE_DELAY = 900;
const FAILURE_RATE = 0.25;

/**
 * Mock API call that simulates sending the contact form payload.
 * @param {{ fullname: string; email: string; subject: string; message: string; privacy: boolean }} payload
 * @param {{ success?: string; error?: string }} messages
 * @returns {Promise<{ status: number; message: string }>}
 */
export function submitContactForm(payload, messages = {}) {
  const successMessage = messages.success ?? "Your message was saved successfully.";
  const errorMessage = messages.error ?? "An unexpected error occurred.";
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const shouldFail = Math.random() < FAILURE_RATE;
      if (shouldFail) {
        reject({
          status: 500,
          message: errorMessage,
          payload,
        });
        return;
      }
      resolve({
        status: 200,
        message: successMessage,
        payload,
      });
    }, MOCK_RESPONSE_DELAY);
  });
}
