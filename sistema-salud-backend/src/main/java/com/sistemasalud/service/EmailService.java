package com.sistemasalud.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor @Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}") private String fromEmail;

    @Async
    public void enviarEmailNotificacion(String to, String asunto, String cuerpo) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail); msg.setTo(to);
            msg.setSubject("[SistemaSalud] " + asunto); msg.setText(cuerpo);
            mailSender.send(msg);
            log.info("Email enviado a: {}", to);
        } catch (Exception e) { log.error("Error email a {}: {}", to, e.getMessage()); }
    }
}
