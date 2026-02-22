package com.mischievous.fairies.model.dto.res;

import lombok.Data;

import java.util.List;

@Data
public class PagedResponse<T> {
    private List<T> content;
    private long totalElements;
    private int pageNumber;
    private int pageSize;

    public void setContent(List<T> content) {
        this.content = content.reversed();
    }
}
