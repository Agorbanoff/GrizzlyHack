package com.mischievous.fairies.service;

import com.mischievous.fairies.model.entity.UserEntity;
import com.mischievous.fairies.repository.UserRepository;
import com.mischievous.fairies.security.model.JwtUser;
import com.mischievous.fairies.model.dto.req.UserLoginReqDto;
import com.mischievous.fairies.model.dto.req.UserSignUpReqDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private JwtService jwtService;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String signUp(UserSignUpReqDto reqDto) {
        UserEntity userEntity = new UserEntity();
        userEntity.setUsername(reqDto.getUsername());
        userEntity.setPasswordHash(passwordEncoder.encode(reqDto.getPassword()));
        UserEntity saved = userRepository.save(userEntity);

        JwtUser jwtUser = new JwtUser();
        jwtUser.setUsername(saved.getUsername());
        jwtUser.setId(saved.getId());
        return jwtService.createToken(jwtUser);
    }

    public String login (UserLoginReqDto reqDto) {
        Optional<UserEntity> opt = userRepository.findByUsername(reqDto.getUsername());
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        UserEntity user = opt.get();
        if (!passwordEncoder.matches(reqDto.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        JwtUser jwtUser = new JwtUser();
        jwtUser.setUsername(user.getUsername());
        jwtUser.setId(user.getId());
        return jwtService.createToken(jwtUser);
    }

    public JwtUser me(String jwt) {
        return jwtService.extractUserData(jwt);
    }
}
