/// <reference types="cypress" />

import "cypress-file-upload";

describe("PERFIL: tests independientes (ver, editar nombre, subir, eliminar, logout)", () => {
  const token = "mock-token-for-testing";
  const instId = "123";

  beforeEach(() => {
    // Mocks de API
    cy.intercept("GET", "**/admin/perfil", {
      statusCode: 200,
      body: {
        institucion: {
          id_institucion: instId,
          nombre_institucion: "Institución Original",
          logo_url: null,
        },
      },
    }).as("getPerfil");

    cy.intercept("PUT", "**/admin/perfil", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          institucion: {
            id_institucion: instId,
            nombre_institucion: req.body.nombre_institucion ?? "Institución Original",
            logo_url: null,
          },
        },
      });
    }).as("putPerfil");

    // Visitar la página asegurando que localStorage esté poblado antes de cargar la app
    cy.visit("/dashboard/perfil", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", token);
        win.localStorage.setItem("id_institucion", instId);
        win.localStorage.setItem("nombre_institucion", "Institución Original");
      },
    });

    // Esperar la carga del perfil en cada prueba
    cy.wait("@getPerfil");
  });

  it("Muestra datos iniciales correctamente", () => {
    cy.get('input[placeholder="Nombre de la institución"]').should("have.value", "Institución Original");
    // visualizamos que otros campos existen (aunque no sean editables en tu versión final)
    cy.get('input[placeholder="Código DANE"]').should("exist");
    cy.get('input[placeholder="Dirección"]').should("exist");
    cy.get('input[placeholder="Teléfono"]').should("exist");
    cy.get('input[placeholder="Ciudad"]').should("exist");
  });

  it("Permite editar y guardar solo el nombre", () => {
    // abrir modo edición
    cy.contains("Editar").should("be.visible").click();

    // editar nombre
    cy.get('input[placeholder="Nombre de la institución"]')
      .clear()
      .type("Nuevo Nombre");

    // guardar y esperar PUT
    cy.contains("Guardar").click();
    cy.wait("@putPerfil");

    // comprobar nuevo valor en UI
    cy.get('input[placeholder="Nombre de la institución"]').should("have.value", "Nuevo Nombre");
  });

  it("Permite subir una imagen y visualizarla", () => {
    // preparar fixture: cypress/fixtures/images/test-logo.png
    const fixturePath = "images/test-logo.png";

    // subir imagen
    cy.get('input[type="file"]').attachFile(fixturePath);

    // verificar que la imagen se renderiza en el <img alt="logo">
    cy.get("img[alt='logo']").should("be.visible");
  });

  it("Permite eliminar la imagen", () => {
    // primero subir imagen para asegurar estado
    const fixturePath = "images/test-logo.png";
    cy.get('input[type="file"]').attachFile(fixturePath);
    cy.get("img[alt='logo']").should("exist");

    // hacer click en Quitar
    cy.contains("Quitar").should("be.visible").click();

    // comprobar que la imagen ya no existe
    cy.get("img[alt='logo']").should("not.exist");
  });

  it("Realiza logout y redirige a login", () => {
    // Abrir menú de perfil de forma robusta:
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="btn-perfil"]').length) {
        cy.get('[data-cy="btn-perfil"]').click();
      } else if ($body.find('[data-cy="perfil-menu"]').length) {
        cy.get('[data-cy="perfil-menu"]').click();
      } else if ($body.find('button:contains("Institución Original")').length) {
        cy.contains("Institución Original").click();
      } else {
        // fallback: intentar abrir cualquier botón contextual en header
        cy.get("header").find("button").first().click({ force: true });
      }
    });

    // Hacer click en la opción de cerrar sesión (preferir selector data-cy)
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="cerrar-sesion"]').length) {
        cy.get('[data-cy="cerrar-sesion"]').click();
      } else if ($body.find('button:contains("Cerrar sesión")').length) {
        cy.contains("Cerrar sesión").click();
      } else {
        cy.contains(/Cerrar sesión|Salir|Log out/i).click({ force: true });
      }
    });

    // Verificar que el token desapareció y hubo redirección a /login (timeout por si hay animaciones)
    cy.window().its("localStorage.token").should("be.undefined");
    cy.url({ timeout: 5000 }).should("include", "/login");
  });
});
