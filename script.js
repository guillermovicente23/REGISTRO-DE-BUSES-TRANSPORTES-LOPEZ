import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/ControladorAutobuses")
public class ControladorAutobuses extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Configuración de la conexión a tu Base de Datos (Ajusta los datos)
    private final String DB_URL = "jdbc:mysql://localhost:3306/control_transporte";
    private final String DB_USER = "root";
    private final String DB_PASSWORD = "tu_password";

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        // Obtenemos el texto que venía dentro del código QR (ej. la placa del autobús)
        String codigoBus = request.getParameter("codigoBus");

        if (codigoBus == null || codigoBus.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Código QR inválido o vacío.");
            return;
        }

        Connection conn = null;
        PreparedStatement psCheck = null;
        PreparedStatement psInsert = null;
        ResultSet rs = null;

        try {
            // 1. Conectar a la base de datos
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);

            // 2. Consultar el último movimiento de este autobús para determinar si entra o sale
            String sqlCheck = "SELECT tipo_movimiento FROM registros_control WHERE codigo_bus = ? "
                            + "ORDER BY fecha_hora DESC LIMIT 1";
            
            psCheck = conn.prepareStatement(sqlCheck);
            psCheck.setString(1, codigoBus);
            rs = psCheck.executeQuery();

            String proximoMovimiento = "ENTRADA"; // Estado por defecto si es la primera vez que pasa
            
            if (rs.next()) {
                String ultimoMovimiento = rs.getString("tipo_movimiento");
                if ("ENTRADA".equals(ultimoMovimiento)) {
                    proximoMovimiento = "SALIDA";
                }
            }

            // 3. Insertar el nuevo registro con la fecha y hora actual del servidor (NOW())
            String sqlInsert = "INSERT INTO registros_control (codigo_bus, tipo_movimiento, fecha_hora) "
                             + "VALUES (?, ?, NOW())";
            
            psInsert = conn.prepareStatement(sqlInsert);
            psInsert.setString(1, codigoBus);
            psInsert.setString(2, proximoMovimiento);
            
            int filasAfectadas = psInsert.executeUpdate();

            if (filasAfectadas > 0) {
                // Enviamos la confirmación que el HTML mostrará en pantalla
                out.print("✓ " + proximoMovimiento + " registrada para el autobús: " + codigoBus);
            } else {
                out.print("No se pudo guardar el registro en la base de datos.");
            }

        } catch (ClassNotFoundException e) {
            out.print("Error de configuración: No se encontró el driver de la BD. " + e.getMessage());
        } catch (SQLException e) {
            out.print("Error en la base de datos: " + e.getMessage());
        } finally {
            // Cerramos todos los recursos de forma segura
            try { if (rs != null) rs.close(); } catch (SQLException e) {}
            try { if (psCheck != null) psCheck.close(); } catch (SQLException e) {}
            try { if (psInsert != null) psInsert.close(); } catch (SQLException e) {}
            try { if (conn != null) conn.close(); } catch (SQLException e) {}
        }
    }
}
