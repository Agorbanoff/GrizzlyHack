package com.mischievous.fairies.service;

import com.mischievous.fairies.security.model.JwtUser;
import com.mischievous.fairies.model.dto.UserLoginReqDto;
import com.mischievous.fairies.model.dto.UserSignUpReqDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private JwtService jwtService;

    @Autowired
    public UserService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public String signUp(UserSignUpReqDto reqDto) {
        JwtUser jwtUser = new JwtUser();
        jwtUser.setUsername(reqDto.getUsername());
        jwtUser.setId(1L);
        return jwtService.createToken(jwtUser);
    }

    public String login (UserLoginReqDto reqDto) {
        JwtUser jwtUser = new JwtUser();
        jwtUser.setUsername(reqDto.getUsername());
        jwtUser.setId(1L);
        return jwtService.createToken(jwtUser);
    }

    public JwtUser me(String jwt) {
        return jwtService.extractUserData(jwt);
    }
}
