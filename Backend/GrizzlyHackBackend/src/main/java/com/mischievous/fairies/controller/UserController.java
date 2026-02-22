package com.mischievous.fairies.controller;

import com.mischievous.fairies.security.model.JwtUser;
import com.mischievous.fairies.model.dto.req.UserLoginReqDto;
import com.mischievous.fairies.model.dto.req.UserSignUpReqDto;
import com.mischievous.fairies.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {
    private UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> signUp(@Valid @RequestBody UserSignUpReqDto reqDto) {
        String jwt = userService.signUp(reqDto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, createJwtCookie(jwt).toString());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .headers(headers)
                .body("Successfully signed up!");
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> login(@Valid @RequestBody UserLoginReqDto reqDto) {
        String jwt = userService.login(reqDto);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, createJwtCookie(jwt).toString());
        return ResponseEntity
                .status(HttpStatus.OK)
                .headers(headers)
                .body("Login successful!");
    }

    @GetMapping("/me")
    public ResponseEntity<JwtUser> me(@CookieValue(name = "access_token") String jwt) {
        JwtUser jwtUser = userService.me(jwt);
        return ResponseEntity.status(HttpStatus.OK)
                .body(jwtUser);
    }

    private ResponseCookie createJwtCookie(String jwt) {
        return ResponseCookie.from("access_token", jwt)
                .httpOnly(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .secure(true)
                .sameSite("Strict")
                .build();
    }
}
