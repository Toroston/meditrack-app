package com.meditrack.back.app.model;

public class HistorialUsuario {
    private String campoModificado;
    private String valorAnterior;
    private String valorActual;
    private String autor;
    private String fecha;

    public HistorialUsuario(String campoModificado, String valorAnterior, String valorActual, String fecha, String autor) {
        this.campoModificado = campoModificado;
        this.valorAnterior = valorAnterior;
        this.valorActual = valorActual;
        this.fecha = fecha;
        this.autor = autor;
    }

    public String getCampoModificado() {
        return campoModificado;
    }

    public String getValorAnterior() {
        return valorAnterior;
    }

    public String getValorActual() {
        return valorActual;
    }

    public String getFecha() {
        return fecha;
    }

    public String getAutor() {
        return autor;
    }
}