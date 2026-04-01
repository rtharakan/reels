package com.reels.app.features.mood

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

class MoodRepository(private val client: HttpClient, private val baseUrl: String) {

    suspend fun setMood(request: SetMoodRequest): SetMoodResponse =
        client.post("$baseUrl/mood.setMood") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()

    suspend fun getSuggestions(mood: String): GetSuggestionsResponse =
        client.get("$baseUrl/mood.getSuggestions") {
            parameter("input", """{"json":{"mood":"$mood"}}""")
        }.body()

    suspend fun getHistory(): MoodHistoryResponse =
        client.get("$baseUrl/mood.getHistory").body()

    suspend fun tagFilm(request: TagFilmRequest): Unit =
        client.post("$baseUrl/mood.tagFilm") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()

    suspend fun expressInterest(request: ExpressInterestRequest): ExpressInterestResponse =
        client.post("$baseUrl/mood.expressInterest") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()
}
