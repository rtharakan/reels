package com.reels.app.features.picker

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

class PickerRepository(private val client: HttpClient, private val baseUrl: String) {

    suspend fun searchFilms(query: String): SearchFilmsResponse =
        client.get("$baseUrl/picker.searchFilms") {
            parameter("input", """{"json":{"query":"$query"}}""")
        }.body()

    suspend fun getShowtimes(filmTitle: String, city: String?): ShowtimesResponse =
        client.get("$baseUrl/picker.getShowtimes") {
            parameter("input", """{"json":{"filmTitle":"$filmTitle","city":${city?.let { "\"$it\"" } ?: "null"}}}""")
        }.body()

    suspend fun createPlan(request: CreatePlanRequest): CreatePlanResponse =
        client.post("$baseUrl/picker.create") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()

    suspend fun getPlan(planId: String): PickerPlanDetail =
        client.get("$baseUrl/picker.get") {
            parameter("input", """{"json":{"planId":"$planId"}}""")
        }.body()

    suspend fun joinPlan(request: JoinPlanRequest): JoinPlanResponse =
        client.post("$baseUrl/picker.join") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()

    suspend fun vote(request: VoteRequest): VoteResponse =
        client.post("$baseUrl/picker.vote") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()

    suspend fun confirmPlan(request: ConfirmRequest): ConfirmResponse =
        client.post("$baseUrl/picker.confirm") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()

    suspend fun myPlans(): MyPlansResponse =
        client.get("$baseUrl/picker.myPlans").body()
}
