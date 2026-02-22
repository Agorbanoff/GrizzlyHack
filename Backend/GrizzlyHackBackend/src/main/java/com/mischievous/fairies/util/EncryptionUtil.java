package com.mischievous.fairies.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class EncryptionUtil {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LEN = 12;
    private static final int TAG_LEN_BITS = 128;

    private final SecretKeySpec keySpec;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionUtil(@Value("${ENCRYPTION_KEY_B64}") String keyB64) {
        byte[] key = Base64.getDecoder().decode(keyB64);
        if (key.length != 32) throw new IllegalArgumentException("ENCRYPTION_KEY_B64 must decode to 32 bytes");
        this.keySpec = new SecretKeySpec(key, "AES");
    }

    // ---- NEW: byte[] encryption (optionally binds to AAD) ----

    public byte[] encryptBytes(byte[] plaintext) {
        return encryptBytes(plaintext, null);
    }

    public byte[] encryptBytes(byte[] plaintext, byte[] aad) {
        try {
            byte[] iv = new byte[IV_LEN];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(TAG_LEN_BITS, iv));
            if (aad != null && aad.length > 0) cipher.updateAAD(aad);

            byte[] ct = cipher.doFinal(plaintext);

            byte[] out = new byte[IV_LEN + ct.length];
            System.arraycopy(iv, 0, out, 0, IV_LEN);
            System.arraycopy(ct, 0, out, IV_LEN, ct.length);

            return out;
        } catch (Exception e) {
            throw new RuntimeException("Encrypt failed", e);
        }
    }

    public byte[] decryptBytes(byte[] ivAndCiphertext) {
        return decryptBytes(ivAndCiphertext, null);
    }

    public byte[] decryptBytes(byte[] ivAndCiphertext, byte[] aad) {
        try {
            if (ivAndCiphertext == null || ivAndCiphertext.length <= IV_LEN) {
                throw new IllegalArgumentException("Invalid payload");
            }

            byte[] iv = new byte[IV_LEN];
            byte[] ct = new byte[ivAndCiphertext.length - IV_LEN];

            System.arraycopy(ivAndCiphertext, 0, iv, 0, IV_LEN);
            System.arraycopy(ivAndCiphertext, IV_LEN, ct, 0, ct.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(TAG_LEN_BITS, iv));
            if (aad != null && aad.length > 0) cipher.updateAAD(aad);

            return cipher.doFinal(ct);
        } catch (Exception e) {
            throw new RuntimeException("Decrypt failed", e);
        }
    }

    // ---- Keep existing String methods (same concept) ----

    public String encrypt(String plaintext) {
        byte[] pt = plaintext.getBytes(StandardCharsets.UTF_8);
        byte[] out = encryptBytes(pt);
        return Base64.getEncoder().encodeToString(out);
    }

    public String decrypt(String base64IvAndCiphertext) {
        byte[] in = Base64.getDecoder().decode(base64IvAndCiphertext);
        byte[] pt = decryptBytes(in);
        return new String(pt, StandardCharsets.UTF_8);
    }
}