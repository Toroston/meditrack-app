package com.meditrack.back.app.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum EstadoOperativo {
    ACTIVO,
    INACTIVO,
    MANTENIMIENTO;

    @JsonCreator
    public static EstadoOperativo fromString(String value) {
        if (value == null) return null;
        String v = value.trim().toUpperCase();
        if (v.equals("EN_MANTENIMIENTO")) return MANTENIMIENTO;
        return EstadoOperativo.valueOf(v);
    }
}
