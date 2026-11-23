// Turns any failed API call into a message that can be shown to the user.
//
// The backend always answers errors with JSON like:
//   { status: 404, error: "Not Found", message: "Car not found.", path: "...", fieldErrors?: {...} }
// so `message` is the first thing we look for.

const NETWORK_ERROR = "Can't reach the server. Check your internet connection and try again.";
const TIMEOUT_ERROR = "The server took too long to respond. Please try again.";
const SERVER_ERROR = "Something went wrong on our side. Please try again in a moment.";

/**
 * @param {unknown} err       the error thrown by axios (or anything else)
 * @param {string}  fallback  shown when the server gave no usable message
 */
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  const response = err?.response;

  // No response at all: backend down, CORS failure, or no internet.
  if (!response) {
    if (err?.code === "ECONNABORTED" || err?.code === "ETIMEDOUT") return TIMEOUT_ERROR;
    if (err?.code === "ERR_NETWORK" || err?.request) return NETWORK_ERROR;
    return err?.message || fallback;
  }

  const { status, data } = response;
  if (data && typeof data === "object" && !(data instanceof Blob) && typeof data.message === "string" && data.message) {
    return data.message;
  }
  // Plain-text bodies (ignore HTML error pages).
  if (typeof data === "string" && data.trim() && !data.trim().startsWith("<")) {
    return data.trim();
  }
  if (status >= 500) return SERVER_ERROR;
  return fallback;
};

/**
 * Same as getErrorMessage, but also reads JSON errors returned to requests made with
 * `responseType: "blob"` (e.g. the PDF invoice download), where the body arrives as a Blob.
 */
export const getBlobErrorMessage = async (err, fallback) => {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) return parsed.message;
    } catch {
      // not JSON: fall through to the generic handling
    }
    return err.response.status >= 500 ? SERVER_ERROR : fallback;
  }
  return getErrorMessage(err, fallback);
};

/** Per-field validation messages ({ email: "...", password: "..." }), or {} when there are none. */
export const getFieldErrors = (err) => {
  const fieldErrors = err?.response?.data?.fieldErrors;
  return fieldErrors && typeof fieldErrors === "object" ? fieldErrors : {};
};
