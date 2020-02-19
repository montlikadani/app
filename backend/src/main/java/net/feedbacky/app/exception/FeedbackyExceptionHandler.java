package net.feedbacky.app.exception;

import java.util.Arrays;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import net.feedbacky.app.exception.types.InputException;

import io.jsonwebtoken.MalformedJwtException;

/**
 * @author Plajer
 * <p>
 * Created at 30.09.2019
 */
@RestControllerAdvice
public class FeedbackyExceptionHandler {

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity handleNotFound() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new RestApiError(HttpStatus.NOT_FOUND, "Content not found."));
  }

  @ExceptionHandler(FeedbackyRestException.class)
  public ResponseEntity handleException(FeedbackyRestException ex) {
    return ResponseEntity.status(ex.getHttpStatus()).body(new RestApiError(ex.getHttpStatus(), ex.getMessage()));
  }

  @ExceptionHandler(UnsupportedOperationException.class)
  public ResponseEntity handleUnsupported(UnsupportedOperationException ex) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new RestApiError(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage()));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity handleMalformed(HttpMessageNotReadableException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RestApiError(HttpStatus.BAD_REQUEST, "Malformed Request. " + ex.getMessage()));
  }

  @ExceptionHandler(InputException.class)
  public ResponseEntity handleInputException(InputException ex) {
    if (ex.getErrors().isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RestApiError(HttpStatus.BAD_REQUEST, ex.getMessage()));
    }
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RestApiError(HttpStatus.BAD_REQUEST, ex.getErrors()));
  }

  @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
  public ResponseEntity handleNotSupported(HttpRequestMethodNotSupportedException ex) {
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new RestApiError(HttpStatus.METHOD_NOT_ALLOWED, "Supported methods: " + Arrays.toString(ex.getSupportedMethods())));
  }

  @ExceptionHandler(MalformedJwtException.class)
  public ResponseEntity handleMalformedJwt() {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new RestApiError(HttpStatus.BAD_REQUEST, "Invalid JWT token provided."));
  }

  @ExceptionHandler(RequestRejectedException.class)
  public RestApiError handleRejected(RequestRejectedException ex) {
    Logger.getLogger("[FIREWALL ERR HANDLE]").log(Level.WARNING, ex.getMessage());
    return new RestApiError(HttpStatus.BAD_REQUEST, "Potentially malicious request denied.");
  }

}
