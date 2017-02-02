package com.jcs.suadeomefront.main

import spark.Filter
import spark.Spark.*
import java.lang.Integer.parseInt
import java.lang.System.getenv
import java.util.Optional.ofNullable
import java.util.logging.Logger

object App {

    val logger = Logger.getLogger("App")
    val backend = getEnv("BACKEND_SERVICE", "http://localhost:4567")

    @JvmStatic
    fun main(args: Array<String>) {
        configureSpark()
        registerRoutes()
    }

    private fun registerRoutes() {
        val externalPublic = getEnv("SPARK_EXTERNAL_PUBLIC_FOLDER", "")
        if (externalPublic.isBlank()) {
            logger.info("Using packaged public folder")
            staticFileLocation("/public")
            staticFiles.expireTime(600);
        } else {
            logger.info("Using EXTERNAL public folder")
            externalStaticFileLocation(externalPublic);
        }

        redirect.get("/", "/public/index.html")

        after(Filter { request, response -> response.header("Content-Encoding", "gzip") })
    }

    private fun configureSpark() {
        val ipAddress = getEnv("OPENSHIFT_DIY_IP", "localhost")
        val port = getIntEnv("OPENSHIFT_DIY_PORT", 4568)

        ipAddress(ipAddress)
        port(port)
    }

    private fun getIntEnv(property: String, defaultValue: Int): Int {
        return ofNullable(getenv(property)).map(::parseInt).orElse(defaultValue)
    }

    private fun getEnv(property: String, defaultValue: String): String {
        return ofNullable(getenv(property)).orElse(defaultValue)
    }

}

