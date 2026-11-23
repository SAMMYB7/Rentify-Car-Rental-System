package com.carrental.sdp.carrental.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Map;

/**
 * The single JSON shape for every error the API returns, so the frontend can always read
 * {@code response.data.message}.
 *
 * <pre>
 * { "timestamp": "2026-11-23T10:15:30Z", "status": 404, "error": "Not Found",
 *   "message": "Car not found.", "path": "/api/cars/...", "fieldErrors": { "email": "..." } }
 * </pre>
 *
 * {@code fieldErrors} only appears for validation errors.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        String timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {

    public static ApiError of(HttpStatusCode status, String message, String path) {
        return of(status, message, path, null);
    }

    public static ApiError of(HttpStatusCode status, String message, String path, Map<String, String> fieldErrors) {
        HttpStatus known = HttpStatus.resolve(status.value());
        String reason = known != null ? known.getReasonPhrase() : "Error";
        return new ApiError(Instant.now().toString(), status.value(), reason, message, path, fieldErrors);
    }
}
