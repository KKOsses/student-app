import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Sidebar } from "./components/sidebar";

export default function App() {
  const [role, setRole] = useState("teacher"); // "teacher" or "student"

  return (
    <div className="flex h-screen">
      <Sidebar role={role} onRoleChange={setRole} />
      <main className="flex-1 p-6 overflow-auto bg-gray-100">
        <Tabs defaultValue="score">
          <TabsList>
            <TabsTrigger value="score">คะแนน</TabsTrigger>
            <TabsTrigger value="behavior">พฤติกรรม</TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <Card>
              <CardContent>
                {role === "teacher" ? (
                  <div>
                    <h2 className="text-xl font-bold mb-4">จัดการคะแนนนักเรียน</h2>
                    <Button>เพิ่มข้อมูลคะแนน</Button>
                    <Button variant="secondary" className="ml-2">แก้ไข / ลบ คะแนน</Button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold mb-4">คะแนนของฉัน</h2>
                    <p>แสดงข้อมูลคะแนนจาก Google Sheet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior">
            <Card>
              <CardContent>
                {role === "teacher" ? (
                  <div>
                    <h2 className="text-xl font-bold mb-4">บันทึกพฤติกรรมนักเรียน</h2>
                    <Button>เพิ่มบันทึกพฤติกรรม</Button>
                    <Button variant="secondary" className="ml-2">ดู / แก้ไข / ลบ</Button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold mb-4">พฤติกรรมของฉัน</h2>
                    <p>แสดงบันทึกพฤติกรรมจาก Google Sheet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}