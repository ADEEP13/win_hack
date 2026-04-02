"use client";

import { useState, useEffect } from "react";

interface TableData {
  success: boolean;
  database?: string;
  note?: string;
  tables?: {
    [key: string]: {
      count: number;
      columns: string[];
      sample: any[];
    };
  };
  postgresqlTables?: {
    [key: string]: string;
  };
  table?: string;
  totalRecords?: number;
  recordsShown?: number;
  data?: any[];
  error?: string;
}

export default function DatabaseViewer() {
  const [allTables, setAllTables] = useState<TableData | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("crops");
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(50);

  // Fetch all tables on mount
  useEffect(() => {
    fetchAllTables();
  }, []);

  // Fetch specific table when selected
  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, limit]);

  const fetchAllTables = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/debug/database");
      const data = await res.json();
      setAllTables(data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      alert("Error: Could not fetch database. Make sure you're in development mode.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (table: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/debug/database?table=${table}&limit=${limit}`);
      const data = await res.json();
      if (data.data) {
        setTableData(data.data);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Database Viewer Disabled</h1>
          <p className="text-red-700">This feature is only available in development mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📊 Database Viewer</h1>
          <p className="text-gray-400">JanDhan Plus - Development Mode</p>
        </div>

        {/* Stats */}
        {allTables && allTables.tables && (
          <div>
            <h2 className="text-xl font-bold mb-4">📝 In-Memory Tables</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {Object.entries(allTables.tables).map(([name, info]: any) => (
                <div
                  key={name}
                  className="bg-blue-900 p-4 rounded-lg cursor-pointer hover:bg-blue-800 transition"
                  onClick={() => setSelectedTable(name)}
                >
                  <div className="text-sm text-gray-400 uppercase">{name}</div>
                  <div className="text-2xl font-bold">{info.count}</div>
                  <div className="text-xs text-gray-500">records</div>
                </div>
              ))}
            </div>

            {allTables.postgresqlTables && (
              <div className="bg-yellow-900 p-4 rounded-lg mb-8">
                <h3 className="font-bold mb-2">🗄️ PostgreSQL Tables Available:</h3>
                <p className="text-sm text-yellow-200">
                  {Object.keys(allTables.postgresqlTables).join(", ")}
                </p>
                <p className="text-xs text-yellow-300 mt-2">
                  Use pgAdmin, DBeaver, or psql CLI to view PostgreSQL tables
                </p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="bg-gray-800 p-4 rounded-lg mb-8 flex gap-4 items-center flex-wrap">
          <div>
            <label className="text-sm text-gray-400 mr-2">Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white p-2 rounded"
            >
              <option value="" disabled>
                Select table
              </option>
              {allTables?.tables &&
                Object.keys(allTables.tables).map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mr-2">Limit:</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              min={1}
              max={1000}
              className="bg-gray-700 border border-gray-600 text-white p-2 rounded w-24"
            />
          </div>

          <button
            onClick={() => fetchTableData(selectedTable)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={() => {
              const data = tableData ? JSON.stringify(tableData, null, 2) : "No data";
              const element = document.createElement("a");
              element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
              element.setAttribute("download", `${selectedTable}.json`);
              element.style.display = "none";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
          >
            Download JSON
          </button>
        </div>

        {/* Table View */}
        {tableData && tableData.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  {Object.keys(tableData[0]).map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left font-semibold text-gray-300 border-r border-gray-600"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    {Object.entries(row).map(([key, value]: any) => (
                      <td
                        key={key}
                        className="px-4 py-3 border-r border-gray-700 text-gray-300 max-w-xs overflow-hidden text-ellipsis"
                        title={String(value)}
                      >
                        {typeof value === "object"
                          ? JSON.stringify(value).substring(0, 50) + "..."
                          : String(value).substring(0, 100)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-gray-700 text-sm text-gray-400 border-t border-gray-600">
              Showing {tableData.length} of {tableData.length} records
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {selectedTable ? "No data available" : "Select a table to view data"}
          </div>
        )}

        {/* SQL Query Helper */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-4">� Available Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-bold text-green-400 mb-3">✅ In-Memory Tables (via API):</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Crops - API: /api/debug/database?table=crops</li>
                <li>• Offers - API: /api/debug/database?table=offers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-yellow-400 mb-3">📊 PostgreSQL Tables (via Tools):</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Users</li>
                <li>• Payments</li>
                <li>• Transactions</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h4 className="font-bold text-blue-400 mb-3">🔧 How to Access PostgreSQL:</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="bg-gray-700 p-3 rounded font-mono">
                <div className="text-gray-400 mb-1">Option 1 - psql CLI:</div>
                <div className="text-green-400">psql postgresql://jandhan_user:changeme123@localhost:5432/jandhan_plus</div>
              </div>
              <div className="bg-gray-700 p-3 rounded font-mono">
                <div className="text-gray-400 mb-1">Option 2 - pgAdmin (Web UI):</div>
                <div className="text-blue-400">http://localhost:5050</div>
              </div>
              <div className="bg-gray-700 p-3 rounded font-mono">
                <div className="text-gray-400 mb-1">Option 3 - DBeaver (Desktop):</div>
                <div className="text-purple-400">Download from dbeaver.io</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
