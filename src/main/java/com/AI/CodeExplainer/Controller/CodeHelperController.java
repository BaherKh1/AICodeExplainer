package com.AI.CodeExplainer.Controller;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CodeHelperController {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explainCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String task = request.get("task");
        System.out.println("Received request: code=" + code + ", task=" + task);

        String prompt = task.equalsIgnoreCase("explain")
                ? "Explain this code step by step:\n\n" + code
                : "Convert this code to " + task + ":\n\n" + code;

        try {
            JSONObject content = new JSONObject()
                    .put("role", "user")
                    .put("parts", new JSONArray().put(new JSONObject().put("text", prompt)));

            JSONObject requestBody = new JSONObject()
                    .put("contents", new JSONArray().put(content));

HttpRequest httpRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
    .build();


            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            System.out.println("Gemini API response: " + response.body());

            JSONObject json = new JSONObject(response.body());
            if (!json.has("candidates")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", json.toString()));
            }

            String output = json.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");

            return ResponseEntity.ok(Map.of("output", output));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
