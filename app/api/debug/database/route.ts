import { NextRequest, NextResponse } from "next/server";
import { marketplaceDB } from "@/lib/marketplace-db";

/**
 * GET /api/debug/database
 * View all in-memory database tables in JSON format
 * 
 * Note: This shows in-memory data. For PostgreSQL tables, use:
 * - psql CLI: psql postgresql://jandhan_user:changeme123@localhost:5432/jandhan_plus
 * - pgAdmin: http://localhost:5050
 * - DBeaver: Desktop application
 * 
 * Usage:
 * GET /api/debug/database                    - All tables
 * GET /api/debug/database?table=crops        - Specific table
 * GET /api/debug/database?table=crops&limit=10  - With limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const table = searchParams.get("table");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    // Security warning (only enable in development)
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "Database viewer disabled in production",
          message: "Use pgAdmin or DBeaver instead",
        },
        { status: 403 }
      );
    }

    // Get specific table
    if (table) {
      let data: any[] = [];
      let count = 0;

      switch (table.toLowerCase()) {
        case "crops":
          data = marketplaceDB.crops.slice(0, limit);
          count = marketplaceDB.crops.length;
          break;
        case "offers":
          data = marketplaceDB.offers.slice(0, limit);
          count = marketplaceDB.offers.length;
          break;
        default:
          return NextResponse.json(
            { error: `Table '${table}' not found` },
            { status: 404 }
          );
      }

      return NextResponse.json({
        success: true,
        table,
        totalRecords: count,
        recordsShown: data.length,
        limit,
        data,
      });
    }

    // Return all tables summary
    return NextResponse.json({
      success: true,
      database: "jandhan_plus",
      note: "In-Memory Tables (Real PostgreSQL requires pgAdmin/CLI)",
      tables: {
        crops: {
          count: marketplaceDB.crops.length,
          columns: [
            "id",
            "farmerId",
            "farmerName",
            "farmerPhone",
            "farmerLocation",
            "cropName",
            "quantity",
            "harvestedDate",
            "pricePerKg",
            "quality",
            "blockchain",
            "imageUrl",
            "createdAt",
          ],
          sample: marketplaceDB.crops.slice(0, 3),
        },
        offers: {
          count: marketplaceDB.offers.length,
          columns: [
            "id",
            "cropId",
            "buyerName",
            "buyerPhone",
            "offerPrice",
            "quantity",
            "bankAccount",
            "message",
            "createdAt",
            "status",
            "blockchainHash",
            "respondedAt",
            "qrCodeId",
            "qrCodeUrl",
            "qrCodeImage",
          ],
          sample: marketplaceDB.offers.slice(0, 3),
        },
      },
      postgresqlTables: {
        users: "Use pgAdmin/psql/DBeaver for PostgreSQL tables",
        payments: "Use pgAdmin/psql/DBeaver for PostgreSQL tables",
        transactions: "Use pgAdmin/psql/DBeaver for PostgreSQL tables",
      },
      instructions: {
        viewInMemory: "GET /api/debug/database?table=crops",
        postgresqlAccess: {
          psql: "psql postgresql://jandhan_user:changeme123@localhost:5432/jandhan_plus",
          pgAdmin: "http://localhost:5050",
          connectionString:
            "postgresql://jandhan_user:changeme123@localhost:5432/jandhan_plus",
        },
      },
    });
  } catch (error) {
    console.error("Database viewer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch database", details: String(error) },
      { status: 500 }
    );
  }
}
