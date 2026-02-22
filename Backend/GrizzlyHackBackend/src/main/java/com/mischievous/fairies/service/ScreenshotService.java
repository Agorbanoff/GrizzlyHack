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
import java.time.Instant;
import java.util.Optional;

@Service
public class ScreenshotService {
    private final ScreenshotRepository screenshotRepository;
    private final CheckpointRepository checkpointRepository;

    private final Path storageRoot = Paths.get("./grizzly/files");

    @Autowired
    public ScreenshotService(ScreenshotRepository screenshotRepository,
                             CheckpointRepository checkpointRepository) {
        this.screenshotRepository = screenshotRepository;
        this.checkpointRepository = checkpointRepository;
    }

    @Transactional
    public void saveScreenshot(Long userId, MultipartFile file, Long checkpointId) throws IOException {
        Optional<CheckpointEntity> checkpointEntityOptional = checkpointRepository.findById(checkpointId);
        CheckpointEntity checkpointEntity = checkpointEntityOptional.orElseThrow(() -> new IllegalArgumentException("Checkpoint not found"));
        if (checkpointEntity.getSession().getUser().getId().equals(userId)) {
            String filename = System.currentTimeMillis() + "-" + checkpointId + "-" + file.getOriginalFilename();
            ScreenshotEntity screenshotEntity = new ScreenshotEntity();
            screenshotEntity.setCheckpoint(checkpointEntity);
            screenshotEntity.setFilePath(storageRoot.resolve(filename).toString());
            screenshotEntity.setTimestamp(Instant.now());
            screenshotEntity.setDescription("Uploaded: " + file.getOriginalFilename());
            screenshotRepository.save(screenshotEntity);
            checkpointEntity.getScreenshots().add(screenshotEntity);
            saveFile(file, filename);
        } else {
            throw new IllegalArgumentException("Not allowed");
        }
    }

    private void saveFile(MultipartFile file, String filename) throws IOException {
        byte[] bytes = file.getBytes();
        Path filePath = storageRoot.resolve(filename);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, bytes);
    }

    public Optional<ScreenshotEntity> getScreenshot(Long id, Long userId) {
        Optional<ScreenshotEntity> opt = screenshotRepository.findById(id);
        if (opt.isPresent() && opt.get().getCheckpoint().getSession().getUser().getId().equals(userId)) {
            return opt;
        }
        return Optional.empty();
    }

    @Transactional
    public void deleteScreenshot(Long id, Long userId) throws IOException {
        Optional<ScreenshotEntity> opt = screenshotRepository.findById(id);
        ScreenshotEntity screenshotEntity = opt.orElseThrow(() -> new IllegalArgumentException("Screenshot not found"));
        if (!screenshotEntity.getCheckpoint().getSession().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not allowed");
        }
        screenshotRepository.deleteById(id);
    }
}
