package com.meditrack.back.app.model;

public enum EstadoEnvio {
    PENDIENTE,
    ASIGNADO,
    EN_PREPARACION,
    EN_TRANSITO,
    EN_PUNTO_DE_ENTREGA,
    ENTREGADO,
    INCIDENTE_REPORTADO,
    CANCELADO;

    public EstadoEnvio siguiente() {
        EstadoEnvio[] valores = values();
        int siguiente = this.ordinal() + 1;
        if (siguiente >= valores.length) {
            throw new IllegalStateException("El envío ya está en su estado final: " + this);
        }

        return valores[siguiente];
    }

}
