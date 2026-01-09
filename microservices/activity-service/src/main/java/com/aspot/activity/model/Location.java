package com.aspot.activity.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @Field(type = FieldType.Double)
    private Double latitude;
    
    @Field(type = FieldType.Double)
    private Double longitude;
    
    @Field(type = FieldType.Text)
    private String address;
    
    @Field(type = FieldType.Text)
    private String city;
    
    @Field(type = FieldType.Text)
    private String country;
}