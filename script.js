import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/ControladorAutobuses")
public class ControladorAutobuses extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Configuración de tu Base de Datos SQL
    private final String DB_URL = "jdbc:mysql://localhost:3306/control_transporte";
    private final String DB_USER = "root";
    private final String DB_PASSWORD = "tu_password";

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        // Capturamos los dos parámetros enviados por la petición JavaScript FETCH
        String codigoBus = request.getParameter("codigoBus");
        String movimiento = request.getParameter("movimiento");

        if (codigoBus == null || codigoBus.trim().isEmpty() || movimiento == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Error: Datos incompletos recibidos en el servidor.");
            return;
        }

        Connection conn = null;
        PreparedStatement psInsert = null;

        try {
            // Conexión estándar mediante Driver JDBC
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);

            // Query para insertar directo la Placa, el Movimiento seleccionado y el Tiempo exacto
            String sqlInsert = "INSERT INTO registros_control (codigo_bus, tipo_movimiento, fecha_hora) "
                             + "VALUES (?, ?, NOW())";
            
            psInsert = conn.prepareStatement(sqlInsert);
            psInsert.setString(1, codigoBus.toUpperCase());
            psInsert.setString(2, movimiento.toUpperCase());
            
            int filasInsertadas = psInsert.executeUpdate();

            if (filasInsertadas > 0) {
                // Mensaje de éxito que retorna directo a la pantalla del HTML
                out.print("✓ REGISTRO EXITOSO: " + movimiento + " de la Unidad " + codigoBus);
            } else {
                out.print("Error: No se pudo almacenar el registro.");
            }

        } catch (ClassNotFoundException e) {
            out.print("Error Interno: Driver de SQL faltante. " + e.getMessage());
        } catch (SQLException e) {
            out.print("Error de SQL: " + e.getMessage());
        } finally {
            // Liberación limpia de canales de conexión
            try { if (psInsert != null) psInsert.close(); } catch (SQLException e) {}
            try { if (conn != null) conn.close(); } catch (SQLException e) {}
        }
    }
}
