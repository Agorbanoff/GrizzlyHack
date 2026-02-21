package com.mischievous.fairies.service;

import com.mischievous.fairies.model.entity.CheckpointEntity;
import com.mischievous.fairies.model.entity.ScreenshotEntity;
import com.mischievous.fairies.repository.CheckpointRepository;
import com.mischievous.fairies.repository.ScreenshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Service
public class ScreenshotService {
    private final ScreenshotRepository screenshotRepository;
    private final CheckpointRepository checkpointRepository;

    @Autowired
    public ScreenshotService(ScreenshotRepository screenshotRepository,
                             CheckpointRepository checkpointRepository) {
        this.screenshotRepository = screenshotRepository;
        this.checkpointRepository = checkpointRepository;
    }

    @Transactional
    public void saveScreenshot(Long userId, MultipartFile file, Long checkpointId) throws IOException {
        Optional<CheckpointEntity> checkpointEntityOptional = checkpointRepository.findById(checkpointId);
        CheckpointEntity checkpointEntity = checkpointEntityOptional.get();
        if (checkpointEntity.getSession().getUser().getId().equals(userId)) {
            ScreenshotEntity screenshotEntity = new ScreenshotEntity();
            screenshotEntity.setCheckpoint(checkpointEntity);
            screenshotEntity.setFilePath(String.format("/grizzly/files/%s", file.getOriginalFilename()));
            screenshotRepository.save(screenshotEntity);
            saveFile(file);
        }
    }

    private void saveFile(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        Path filePath = Paths.get("/grizzly/files" + file.getOriginalFilename());
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, bytes);
    }

}
