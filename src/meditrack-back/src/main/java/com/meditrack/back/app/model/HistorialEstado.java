package com.meditrack.back.app.model;

public class HistorialEstado {
    private String tipo;
    private EstadoEnvio estado;
    private String detalle;
    private String fecha;
    private String hora;
    private String usuario;

    public HistorialEstado() {}

    public HistorialEstado(String tipo, EstadoEnvio estado, String detalle, String fecha, String hora, String usuario) {
        this.tipo = tipo;
        this.estado = estado;
        this.detalle = detalle;
        this.fecha = fecha;
        this.hora = hora;
        this.usuario = usuario;
    }

    // Getters y Setters necesarios para Jackson (JSON)
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public EstadoEnvio getEstado() { return estado; }
    public void setEstado(EstadoEnvio estado) { this.estado = estado; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
}