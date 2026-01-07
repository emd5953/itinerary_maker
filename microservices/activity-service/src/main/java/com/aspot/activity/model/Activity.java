package com.aspot.activity.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "activities")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Activity {
    
    @Id
    private String id;
    
    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;
    
    @Field(type = FieldType.Text)
    private String description;
    
    @Field(type = FieldType.Keyword)
    private String destination;
    
    @Field(type = FieldType.Double)
    private Double rating;
    
    @Field(type = FieldType.Integer)
    private Integer reviewCount;
    
    @Field(type = FieldType.Keyword)
    private String priceRange;
    
    @Field(type = FieldType.Keyword)
    private ActivityCategory category;
    
    @Field(type = FieldType.Nested)
    private Location location;
    
    @Field(type = FieldType.Keyword)
    private List<String> tags;
    
    @Field(type = FieldType.Boolean)
    private Boolean isPopular;
    
    @Field(type = FieldType.Text)
    private String imageUrl;
    
    @Field(type = FieldType.Text)
    private String websiteUrl;
    
    @Field(type = FieldType.Text)
    private String phoneNumber;
}