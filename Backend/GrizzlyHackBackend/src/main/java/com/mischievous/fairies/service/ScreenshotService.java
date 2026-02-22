package com.mischievous.fairies.service;

import com.mischievous.fairies.model.dto.res.ScreenshotResDto;
import com.mischievous.fairies.model.entity.CheckpointEntity;
import com.mischievous.fairies.model.entity.ScreenshotEntity;
import com.mischievous.fairies.repository.CheckpointRepository;
import com.mischievous.fairies.repository.ScreenshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ScreenshotService {
    private final ScreenshotRepository screenshotRepository;
    private final CheckpointRepository checkpointRepository;

    private final Path storageRoot =
            Paths.get("./grizzly/files").toAbsolutePath().normalize();


    @Autowired
    public ScreenshotService(ScreenshotRepository screenshotRepository,
                             CheckpointRepository checkpointRepository) {
        this.screenshotRepository = screenshotRepository;
        this.checkpointRepository = checkpointRepository;
    }

    @Transactional
    public ScreenshotResDto saveScreenshot(Long userId, MultipartFile file, Long checkpointId) throws IOException {
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
            return new ScreenshotResDto(screenshotEntity.getId());
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

    public Resource getScreenshot(Long checkpointId, Long id, Long userId) throws MalformedURLException {
        Optional<CheckpointEntity> checkpointEntityOptional = checkpointRepository.findById(checkpointId);
        if (!checkpointEntityOptional.isPresent()) {
            throw new IllegalArgumentException("Checkpoint not found");
        }
        CheckpointEntity checkpointEntity = checkpointEntityOptional.get();
        if (!checkpointEntity.getSession().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not allowed");
        };
        Optional<ScreenshotEntity> opt = screenshotRepository.findByCheckpoint_IdAndId(checkpointId, id);
        if (!opt.isPresent()) {
            throw new IllegalArgumentException("Screenshot not found");
        }
        ScreenshotEntity screenshotEntity = opt.get();
        if (!screenshotEntity.getCheckpoint().getSession().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not allowed");
        }
        Path path = Paths.get(screenshotEntity.getFilePath()).toAbsolutePath().normalize();
        return new UrlResource(path.toUri());
    }

    public List<ScreenshotResDto> getScreenshotIdsForCheckpoint(Long checkpointId, Long userId) {
        Optional<CheckpointEntity> checkpointEntityOptional = checkpointRepository.findById(checkpointId);
        if (!checkpointEntityOptional.isPresent()) {
            throw new IllegalArgumentException("Checkpoint not found");
        }
        CheckpointEntity checkpointEntity = checkpointEntityOptional.get();
        if (!checkpointEntity.getSession().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Not allowed");
        }
        List<ScreenshotEntity> screenshots = screenshotRepository.findAllByCheckpoint_Id(checkpointId);
        List<ScreenshotResDto> screenshotResDtos = new ArrayList<>();
        for (ScreenshotEntity screenshotEntity : screenshots) {
            ScreenshotResDto screenshotResDto = new ScreenshotResDto();
            screenshotResDto.setId(screenshotEntity.getId());
            screenshotResDtos.add(screenshotResDto);
        }
        return  screenshotResDtos;
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
