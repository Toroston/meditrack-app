package com.meditrack.back.app.model;

import java.util.List;
import java.util.Map;

public class DashboardKpiDTO {
    private List<Map<String, Object>> volumenEnvios;
    private long entregasDia;
    private double tasaIncidencias;
    private String tipoClienteMasRetira;
    private String tipoClienteMasRecibe;
    private List<Map<String, Object>> topMedicamentos;
    private List<Map<String, Object>> topClientes;

    public DashboardKpiDTO(List<Map<String, Object>> volumenEnvios, long entregasDia, double tasaIncidencias,
            String tipoClienteMasRetira, String tipoClienteMasRecibe,
            List<Map<String, Object>> topMedicamentos, List<Map<String, Object>> topClientes) {
        this.volumenEnvios = volumenEnvios;
        this.entregasDia = entregasDia;
        this.tasaIncidencias = tasaIncidencias;
        this.tipoClienteMasRetira = tipoClienteMasRetira;
        this.tipoClienteMasRecibe = tipoClienteMasRecibe;
        this.topMedicamentos = topMedicamentos;
        this.topClientes = topClientes;
    }

    public List<Map<String, Object>> getVolumenEnvios() {
        return volumenEnvios;
    }

    public void setVolumenEnvios(List<Map<String, Object>> volumenEnvios) {
        this.volumenEnvios = volumenEnvios;
    }

    public long getEntregasDia() {
        return entregasDia;
    }

    public void setEntregasDia(long entregasDia) {
        this.entregasDia = entregasDia;
    }

    public double getTasaIncidencias() {
        return tasaIncidencias;
    }

    public void setTasaIncidencias(double tasaIncidencias) {
        this.tasaIncidencias = tasaIncidencias;
    }

    public String getTipoClienteMasRetira() {
        return tipoClienteMasRetira;
    }

    public void setTipoClienteMasRetira(String tipoClienteMasRetira) {
        this.tipoClienteMasRetira = tipoClienteMasRetira;
    }

    public String getTipoClienteMasRecibe() {
        return tipoClienteMasRecibe;
    }

    public void setTipoClienteMasRecibe(String tipoClienteMasRecibe) {
        this.tipoClienteMasRecibe = tipoClienteMasRecibe;
    }

    public List<Map<String, Object>> getTopMedicamentos() {
        return topMedicamentos;
    }

    public void setTopMedicamentos(List<Map<String, Object>> topMedicamentos) {
        this.topMedicamentos = topMedicamentos;
    }

    public List<Map<String, Object>> getTopClientes() {
        return topClientes;
    }

    public void setTopClientes(List<Map<String, Object>> topClientes) {
        this.topClientes = topClientes;
    }

}