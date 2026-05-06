package com.meditrack.back.app.model;

public class TrackingPublicoDTO {
    private String trackingId;
    private String estado;
    private String fechaUltimoEstado;
    private String horaUltimoEstado;

    public TrackingPublicoDTO(String trackingId, String estado, 
        String fechaUltimoEstado, String horaUltimoEstado) {
        this.trackingId = trackingId;
        this.estado = estado;
        this.fechaUltimoEstado = fechaUltimoEstado;
        this.horaUltimoEstado = horaUltimoEstado;
    }

    public String getTrackingId() {
        return trackingId;
    }

    public String getEstado() {
        return estado;
    }

    public String getFechaUltimoEstado() {
        return fechaUltimoEstado;
    }

    public String getHoraUltimoEstado() {
        return horaUltimoEstado;
    }
    
}
