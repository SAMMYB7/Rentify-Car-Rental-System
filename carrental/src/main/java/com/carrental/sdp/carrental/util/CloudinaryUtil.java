package com.carrental.sdp.carrental.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Component
public class CloudinaryUtil {

    @Autowired
    private Cloudinary cloudinary;

    @SuppressWarnings("unchecked")
    public String uploadImage(MultipartFile file) throws IOException {
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        return uploadResult.get("secure_url").toString();
    }

    public void deleteImageByUrl(String imageUrl) throws IOException {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            // Not a Cloudinary URL, skip deletion
            return;
        }
        String[] parts = imageUrl.split("/");
        String publicIdWithExt = parts[parts.length - 1];
        String publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
