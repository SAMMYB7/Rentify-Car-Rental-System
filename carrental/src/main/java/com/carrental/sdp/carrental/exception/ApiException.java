package com.carrental.sdp.carrental.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * A business error with a message that is safe to show to the user and the HTTP status to send.
 * {@link GlobalExceptionHandler} turns it into an {@link ApiError} response.
 *
 * <pre>throw ApiException.notFound("Car not found.");</pre>
 */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public ApiException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    /** Defaults to 400 Bad Request. */
    public ApiException(String message) {
        this(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }

    /** An outside service (Razorpay, Cloudinary, ...) failed. */
    public static ApiException badGateway(String message, Throwable cause) {
        return new ApiException(HttpStatus.BAD_GATEWAY, message, cause);
    }
}
