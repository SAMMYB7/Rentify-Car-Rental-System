package com.carrental.sdp.carrental.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mail.MailException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Turns every exception thrown by a controller into the same {@link ApiError} JSON with the right
 * status code. Messages are written for the end user; technical details go to the log only.
 *
 * 401/403 raised by the security filters (before a controller runs) are written by
 * {@code SecurityConfiguration} in the same format.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    static final String GENERIC_ERROR = "Something went wrong on our side. Please try again in a moment.";

    // ---- Errors raised on purpose by our own code ------------------------------------------------

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApiException(ApiException ex, HttpServletRequest req) {
        if (ex.getStatus().is5xxServerError()) {
            log.warn("{} {} -> {}: {}", req.getMethod(), req.getRequestURI(), ex.getStatus().value(), ex.getMessage(), ex.getCause());
        }
        return build(ex.getStatus(), ex.getMessage(), req);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException ex, HttpServletRequest req) {
        HttpStatusCode status = ex.getStatusCode();
        if (status.is5xxServerError()) {
            log.warn("{} {} -> {}: {}", req.getMethod(), req.getRequestURI(), status.value(), ex.getReason(), ex.getCause());
        }
        String message = ex.getReason() != null ? ex.getReason() : defaultMessage(status);
        return build(status, message, req);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, withFullStop(ex.getMessage(), "We couldn't find what you were looking for."), req);
    }

    // ---- Security: logged in, but not allowed (e.g. @PreAuthorize("hasRole('ADMIN')")) ------------

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "You don't have permission to do that.", req);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Please log in to continue.", req);
    }

    // ---- Bad input from the client -------------------------------------------------------------

    /** {@code @Valid} on a request body failed. Returns every field's message in {@code fieldErrors}. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> fieldErrors.putIfAbsent(e.getField(), e.getDefaultMessage()));
        ex.getBindingResult().getGlobalErrors()
                .forEach(e -> fieldErrors.putIfAbsent(e.getObjectName(), e.getDefaultMessage()));
        return build(HttpStatus.BAD_REQUEST, summarise(fieldErrors), req, fieldErrors);
    }

    /** Validation on method parameters (e.g. {@code @RequestParam @Min(1)}). */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiError> handleMethodValidation(HandlerMethodValidationException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getParameterValidationResults().forEach(result -> {
            String name = result.getMethodParameter().getParameterName();
            result.getResolvableErrors().forEach(err ->
                    fieldErrors.putIfAbsent(name != null ? name : "value", err.getDefaultMessage()));
        });
        return build(HttpStatus.BAD_REQUEST, summarise(fieldErrors), req, fieldErrors);
    }

    /** Body missing, not JSON, or a value of the wrong type (e.g. a date that isn't YYYY-MM-DD). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        log.debug("Unreadable request body on {}: {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST,
                "The request is missing information or has a value in the wrong format.", req);
    }

    /** A path or query value of the wrong type, most often a malformed UUID in the URL. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String message = ex.getRequiredType() == UUID.class
                ? "That link is invalid: '" + ex.getValue() + "' is not a valid ID."
                : "'" + ex.getValue() + "' is not a valid value for '" + ex.getName() + "'.";
        return build(HttpStatus.BAD_REQUEST, message, req);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "The '" + ex.getParameterName() + "' field is required.", req);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiError> handleMissingPart(MissingServletRequestPartException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "The '" + ex.getRequestPartName() + "' part of the form is missing.", req);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleUploadTooLarge(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return build(HttpStatus.CONTENT_TOO_LARGE, "The file is too large. Please choose a smaller image.", req);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, ex.getMethod() + " is not supported for this address.", req);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaType(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "This content type isn't supported here.", req);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResource(NoResourceFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "There is nothing at this address.", req);
    }

    // ---- Infrastructure ------------------------------------------------------------------------

    /** A database rule was broken: duplicate unique value, or a row that other rows still point to. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Data integrity violation on {} {}: {}", req.getMethod(), req.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.CONFLICT,
                "This can't be saved because it clashes with existing data (for example, it is still linked to other records).",
                req);
    }

    @ExceptionHandler(MailException.class)
    public ResponseEntity<ApiError> handleMail(MailException ex, HttpServletRequest req) {
        log.error("Email sending failed on {} {}", req.getMethod(), req.getRequestURI(), ex);
        return build(HttpStatus.SERVICE_UNAVAILABLE,
                "We couldn't send the email right now. Please try again in a few minutes.", req);
    }

    /** Anything unexpected: log everything, show nothing technical. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest req) {
        log.error("Unhandled error on {} {}", req.getMethod(), req.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, GENERIC_ERROR, req);
    }

    // ---- Helpers -------------------------------------------------------------------------------

    private static ResponseEntity<ApiError> build(HttpStatusCode status, String message, HttpServletRequest req) {
        return build(status, message, req, null);
    }

    private static ResponseEntity<ApiError> build(HttpStatusCode status, String message, HttpServletRequest req,
                                                  Map<String, String> fieldErrors) {
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiError.of(status, message, req.getRequestURI(),
                        fieldErrors == null || fieldErrors.isEmpty() ? null : fieldErrors));
    }

    /** "Please fix the following: email - must be valid; password - too short." or the single message. */
    private static String summarise(Map<String, String> fieldErrors) {
        if (fieldErrors.isEmpty()) {
            return "Some of the information you entered isn't valid.";
        }
        if (fieldErrors.size() == 1) {
            return withFullStop(fieldErrors.values().iterator().next(), "That value isn't valid.");
        }
        StringBuilder sb = new StringBuilder("Please fix the following: ");
        fieldErrors.forEach((field, msg) -> sb.append(field).append(" - ").append(msg).append("; "));
        return sb.substring(0, sb.length() - 2) + ".";
    }

    private static String withFullStop(String message, String fallback) {
        if (message == null || message.isBlank()) {
            return fallback;
        }
        String trimmed = message.trim();
        return trimmed.endsWith(".") || trimmed.endsWith("!") || trimmed.endsWith("?") ? trimmed : trimmed + ".";
    }

    private static String defaultMessage(HttpStatusCode status) {
        return switch (status.value()) {
            case 400 -> "The request isn't valid.";
            case 401 -> "Please log in to continue.";
            case 403 -> "You don't have permission to do that.";
            case 404 -> "We couldn't find what you were looking for.";
            case 409 -> "This conflicts with the current state. Please refresh and try again.";
            default -> status.is5xxServerError() ? GENERIC_ERROR : "The request couldn't be completed.";
        };
    }
}
