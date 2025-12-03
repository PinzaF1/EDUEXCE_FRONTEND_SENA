/// <reference types="cypress" />

/*
  cypress/e2e/04-tracking/01-tracking-crud.cy.ts
  Versión final: sin redirecciones a /publicidad, con dos estudiantes,
  y prueba de detalle para Susana e Isabel.
*/

describe("SEGUIMIENTO ", () => {
  const studentA = {
    id_usuario: 101,
    estudiante: "Susana Carolina Gutiérrez Salazar",
    curso: "11-A",
    grado_curso: "11-A",
    telefono: null,
    correo: null,
    documento: "100200300",
    areaDebil: "Lectura Crítica",
    puntaje: 100,
    ultima_actividad: "2025-12-03",
    materia_critica: {
      area: "Lectura Crítica",
      subtema: "comprensión lectora (sentido global y local)",
      porcentaje: 100,
    },
  };

  const studentB = {
    id_usuario: 102,
    estudiante: "Isabel Ana Gomezzzzzz",
    curso: "10-B",
    grado_curso: "10-B",
    telefono: null,
    correo: null,
    documento: "200300400",
    areaDebil: "Matematicas",
    puntaje: 100,
    ultima_actividad: "2025-12-03",
    materia_critica: {
      area: "Matematicas",
      subtema: "operaciones con números enteros",
      porcentaje: 100,
    },
  };

  const apiPerfil = { nombre: "Colegio Ejemplo", id: 1, rol: "admin" };
  const apiResumen = { promedioActual: 45, mejoraEsteMes: 2, estudiantesParticipando: 20 };
  const apiCursos = { items: [] };
  const apiEstudiantes = { estudiantes: [] };
  const apiCriticos = { items: [studentA, studentB] };
  const apiRefuerDet = { areas: [] };

  // ============================================================
  // 🚀 **BEFORE EACH CORREGIDO — NO REDIRECCIONA A /publicidad**
  // ============================================================
  beforeEach(() => {
    cy.visit("/dashboard/seguimiento", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", "mock-token-for-testing");
        win.localStorage.setItem("nombre_institucion", "Colegio Ejemplo");
      },
    });

    cy.intercept("GET", "/api/admin/perfil", { statusCode: 200, body: apiPerfil }).as("getPerfil");
    cy.intercept("GET", "/api/web/seguimiento/resumen", { statusCode: 200, body: apiResumen }).as("getResumen");
    cy.intercept("GET", "/api/admin/estudiantes", { statusCode: 200, body: apiEstudiantes }).as("getEstudiantes");
    cy.intercept("GET", "/api/web/seguimiento/cursos", { statusCode: 200, body: apiCursos }).as("getCursos");
    cy.intercept("GET", "/api/web/seguimiento/areas-refuerzo*", { statusCode: 200, body: { areas: [] } }).as("getRefuer");
    cy.intercept("GET", "/api/web/seguimiento/areas-refuerzo-detalle*", { statusCode: 200, body: apiRefuerDet }).as("getRefuerDet");
    cy.intercept("GET", "/api/web/seguimiento/estudiantes-alerta*", { statusCode: 200, body: apiCriticos }).as("getCriticos");
  });

  // ============================================================
  // 🧪 TEST 1 — Carga correcta
  // ============================================================
  it("Carga la página seguimiento correctamente", () => {
    cy.wait("@getPerfil");
    cy.wait("@getResumen");
    cy.wait("@getCriticos");
    cy.wait("@getRefuerDet");
    cy.wait("@getCursos");

    cy.contains("Estudiantes que requieren atención").should("exist");
    cy.contains("Áreas que Necesitan Refuerzo").should("exist");

    cy.contains("Estudiantes que requieren atención")
      .parents()
      .filter("div")
      .first()
      .within(() => {
        cy.get("p").contains(/\d+/).should("exist");
      });
  });

  // ============================================================
  // 🧪 TEST 2 — Muestra ambos estudiantes
  // ============================================================
  it("Muestra los estudiantes que requieren atención", () => {
    cy.wait("@getResumen");
    cy.wait("@getCriticos");

    cy.contains(studentA.estudiante).should("exist");
    cy.contains(studentB.estudiante).should("exist");
  });

  // ============================================================
  // 🧪 TEST 3 — Detalle de Susana y cierre
  // ============================================================
  it("Permite ver el detalle individual del estudiante", () => {
    cy.wait("@getCriticos");

    cy.contains(studentA.estudiante)
      .should("be.visible")
      .then(($name) => {
        cy.wrap($name).closest("div").parent().within(() => {
          cy.contains("Ver detalles").click();
        });
      });

    cy.contains("Detalle del Estudiante").should("be.visible");
    cy.contains(studentA.estudiante).should("exist");

    cy.get("div.px-5.py-4.border-t").within(() => {
      cy.contains("Cerrar").click();
    });

    cy.contains("Detalle del Estudiante").should("not.exist");
  });
});
