# CUSTOM_GPT

This document includes the name, description, and instructions used to create the Ladderly Custom GPT, accessible in the Open AI [GPT Store](https://openai.com/blog/introducing-the-gpt-store).

## Name

Ladderly Custom GPT

## Description

a tool to help you learn to code and land your first or next programming role

## Instructions

I encapsulate the knowledge held on <https://ladderly.io> and its open-source sources including:

1. <https://github.com/Vandivier/ladderly-3>
2. <https://www.youtube.com/playlist?list=PL4hsXTgWARMzs0dWr8YGLZpFuSZNMscoy>
3. <https://www.youtube.com/playlist?list=PL4hsXTgWARMzFezKkj7vGJKmtX0ugC49t>

## Conversation Starters

1. How can I learn to code?
2. What language is best when learning to code?
3. How can I identify a high-quality coding bootcamp?
4. What sort of projects should I include in my portfolio?
5. After I learn to code, how do I obtain a job?

## Knowledge

attach `ladderly-3/scripts/youtube-transcriber/consolidated_transcript.txt`

## Capabilities

Enable:

1. Web Browsing
2. Dall-E
3. Code Interpreter

## Actions

```yml
openapi: 3.0.0
info:
  title: Aria's Tale Art and Image API
  description: API for searching, retrieving random images, and accessing art rolls in Aria's Tale gallery.
  version: 1.0.0
servers:
  - url: https://www.ariastale.com/api/trpc
    description: Aria's Tale API server
paths:
  /image.getImages:
    get:
      operationId: getImages
      summary: Search for images in Aria's Tale gallery.
      parameters:
        - name: batch
          in: query
          required: true
          description: Batch number for the search query
          schema:
            type: integer
        - name: input
          in: query
          required: true
          description: JSON string containing the search filter
          schema:
            type: string
      responses:
        '200':
          description: Successful response with image data
          content:
            application/json:
              schema:
                type: object
                properties:
                  images:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        url:
                          type: string
                        title:
                          type: string
                        description:
                          type: string
  /image.getRandomImage:
    get:
      operationId: getRandomImage
      summary: Retrieve a random image from the gallery.
      responses:
        '200':
          description: Successful response with a random image
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  createdAt:
                    type: string
                    format: date-time
                  updatedAt:
                    type: string
                    format: date-time
                  description:
                    type: string
                  imageFileName:
                    type: string
                  title:
                    type: string
  /art.getArtRoll:
    get:
      operationId: getArtRoll
      summary: Retrieve a selection of art pieces.
      parameters:
        - name: batch
          in: query
          required: true
          description: Batch number for the art roll query
          schema:
            type: integer
        - name: input
          in: query
          required: true
          description: JSON string for additional query parameters
          schema:
            type: string
      responses:
        '200':
          description: Successful response with art roll data
          content:
            application/json:
              schema:
                type: object
                properties:
                  artRoll:
                    type: array
                    items:
                      type: object
                      properties:
                        subject:
                          type: string
                        style:
                          type: string
```
