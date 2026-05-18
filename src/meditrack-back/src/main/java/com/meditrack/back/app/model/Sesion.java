package com.meditrack.back.app.model;

public class Sesion {

    private String id;
    private String email;
    private String nombre;
    private Role role;

    public Sesion(String id, String email, String nombre, Role role) {

        this.id = id;
        this.email = email;
        this.nombre = nombre;
        this.role = role;
        
    }

    public String getId() { 
        return id; 
    }

    public String getEmail() { 
        return email; 
    }

    public String getNombre() { 
        return nombre; 
    }

    public Role getRole() { 
        return role; 
    }

}
