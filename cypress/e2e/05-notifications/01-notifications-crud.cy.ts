/// <reference types="cypress" />

context("Notificaciones - flujo completo: pestañas, búsqueda, marcar leídas y borrar", () => {
  const baseUrl = Cypress.config("baseUrl") || "http://localhost:5173";

  beforeEach(() => {
    // Simular sesión
    cy.window().then((w) => {
      w.localStorage.setItem("token", "mock-token-for-testing");
      w.localStorage.setItem("nombre_institucion", "Instituto X");
    });

    // Intercept perfil
    cy.intercept("GET", "/api/admin/perfil", {
      statusCode: 200,
      body: { id: 1, nombre: "Admin Mock", rol: "admin", nombre_institucion: "Instituto X" },
    }).as("getPerfil");

    // Intercept lista de notificaciones
    cy.intercept("GET", "/api/admin/notificaciones", {
      statusCode: 200,
      body: [
        { id: 1, title: "Estudiante sin actividad reciente", body: "No hay registro de actividad", estudiante: "Sofi Perez", curso: "A", tipo: "Inactividad", read: false, created_at: new Date().toISOString() },
        { id: 2, title: "Inactividad prolongada", body: "Última actividad hace más de 30 días", estudiante: "Isabel Ana Torres Valencia", curso: "B", tipo: "Inactividad 30d", read: false, created_at: new Date().toISOString() },
        { id: 3, title: "Bajo rendimiento en Matemáticas", body: "Puntaje crítico nivel 2", estudiante: "Juan Lopez", curso: "C", tipo: "Puntaje Bajo", read: false, created_at: new Date().toISOString() },
        { id: 4, title: "Puntaje crítico en Ciencias", body: "Necesita refuerzo urgente", estudiante: "Ana Gómez", curso: "A", tipo: "Puntaje Crítico", read: false, created_at: new Date().toISOString() },
        { id: 5, title: "Área Crítica detectada", body: "Rendimiento bajo en lenguaje", estudiante: "Carlos Ruiz", curso: "B", tipo: "Área Crítica", read: false, created_at: new Date().toISOString() },
        { id: 6, title: "Alerta de comportamiento", body: "Falta de participación en clase", estudiante: "Lucía Martínez", curso: "C", tipo: "Alerta", read: false, created_at: new Date().toISOString() },
        { id: 7, title: "Progreso lento en todas las áreas", body: "Necesita seguimiento personalizado", estudiante: "Pedro Torres", curso: "A", tipo: "Progreso Lento", read: false, created_at: new Date().toISOString() },
      ],
    }).as("getNotifs");

    // Intercept acciones
    cy.intercept("POST", "/api/admin/notificaciones/*/read", { statusCode: 200 }).as("markRead");
    cy.intercept("POST", "/api/admin/notificaciones/mark-all-read", { statusCode: 200 }).as("markAll");
    cy.intercept("DELETE", "/api/admin/notificaciones/*", { statusCode: 200 }).as("deleteNotif");
  });

  it("Carga de la página y pestañas Todas / No Leídas", () => {
    cy.visit(`${baseUrl}/dashboard/notificaciones`);
    cy.wait("@getPerfil");
    cy.wait("@getNotifs");

    cy.get('[data-cy="tab-todas"]').should("have.class", "bg-blue-600");
    cy.get('[data-cy="tab-no-leidas"]').should("not.have.class", "bg-blue-600");

    // Verificar títulos
    const nombres = ["Sofi Perez","Isabel Ana Torres Valencia","Juan Lopez","Ana Gómez","Carlos Ruiz","Lucía Martínez","Pedro Torres"];
    nombres.forEach((n) => cy.contains(n).should("exist"));

    // Cambiar a 'No Leídas'
    cy.get('[data-cy="tab-no-leidas"]').click();
    cy.get('[data-cy="tab-no-leidas"]').should("have.class", "bg-blue-600");
    cy.get('[data-cy^="notif-card-"]').should("have.length", 7);
  });

  it("Búsqueda por estudiante", () => {
    cy.visit(`${baseUrl}/dashboard/notificaciones`);
    cy.wait("@getPerfil");
    cy.wait("@getNotifs");

    cy.get('[data-cy="search-notifs"]').clear().type("Isabel");
    cy.contains("Isabel Ana Torres Valencia").should("exist");
    cy.contains("Sofi Perez").should("not.exist");
  });

  it("Marcar una notificación como leída usando chulito", () => {
    cy.visit(`${baseUrl}/dashboard/notificaciones`);
    cy.wait("@getPerfil");
    cy.wait("@getNotifs");

    // Ir a No Leídas para que desaparezca la tarjeta
    cy.get('[data-cy="tab-no-leidas"]').click();

    cy.get('[data-cy="notif-card-2"]').within(() => {
      cy.get('[data-cy^="mark-read-"]').click();
    });
    cy.wait("@markRead");

    cy.get('[data-cy="notif-card-2"]').should("not.exist");
  });

  it("Eliminar una notificación usando papelera", () => {
    cy.visit(`${baseUrl}/dashboard/notificaciones`);
    cy.wait("@getPerfil");
    cy.wait("@getNotifs");

    // Ir a Todas para eliminar
    cy.get('[data-cy="tab-todas"]').click();
    cy.get('[data-cy="notif-card-1"]').within(() => {
      cy.get('button[data-cy="delete"]').click();
    });
    cy.wait("@deleteNotif");

    cy.get('[data-cy="notif-card-1"]').should("not.exist");
  });

  it("Filtros por tipo", () => {
    cy.visit(`${baseUrl}/dashboard/notificaciones`);
    cy.wait("@getPerfil");
    cy.wait("@getNotifs");

    // Abrir filtros
    cy.get('[data-cy="btn-filtros"]').click();
    cy.get('[data-cy="types-container"]').should("exist");

    const tipos = ["Inactividad","Inactividad 30d","Puntaje Bajo","Puntaje Crítico","Área Crítica","Alerta","Progreso Lento"];

    tipos.forEach((tipo) => {
      const cyType = tipo.toLowerCase().replace(/\s+/g, "-");

      // Activar filtro
      cy.get(`[data-cy="filter-type-${cyType}"]`).click();
      cy.get('[data-cy^="notif-card-"]').each(($card) => {
        cy.wrap($card).contains(tipo).should("exist");
      });
      // Desactivar filtro
      cy.get(`[data-cy="filter-type-${cyType}"]`).click();
    });
  });

  it("Marcar todas como leídas y verificar No Leídas vacía", () => {
    cy.visit(`${baseUrl}/dashboard/notificaciones`);
    cy.wait("@getPerfil");
    cy.wait("@getNotifs");

    cy.get('[data-cy="mark-all-read"]').click();
    cy.wait("@markAll");

    cy.get('[data-cy="tab-no-leidas"]').click();
    cy.contains("No hay notificaciones para mostrar").should("exist");
  });
});
