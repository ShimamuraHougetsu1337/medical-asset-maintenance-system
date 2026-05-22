package com.medical.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
    private Object errors;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .status("SUCCESS")
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return error(message, null);
    }

    public static <T> ApiResponse<T> error(String message, Object errors) {
        return ApiResponse.<T>builder()
                .status("ERROR")
                .message(message)
                .errors(errors)
                .build();
    }
}
