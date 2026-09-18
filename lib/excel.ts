import ExcelJS from "exceljs";
import { formatDateTime } from "@/lib/format";
import type { Registration, RegistrationChoice } from "@/lib/storage";

const CHOICE_LABEL: Record<RegistrationChoice, string> = {
  register: "已报名",
  skip: "不报名",
};

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE0D8C8" } },
  left: { style: "thin", color: { argb: "FFE0D8C8" } },
  bottom: { style: "thin", color: { argb: "FFE0D8C8" } },
  right: { style: "thin", color: { argb: "FFE0D8C8" } },
};

export async function buildRegistrationsWorkbook(
  rows: Registration[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "醉乡堂";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("联赛报名", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "序号", key: "index", width: 8 },
    { header: "游戏名称", key: "gameName", width: 26 },
    { header: "报名状态", key: "choice", width: 14 },
    { header: "报名时间", key: "createdAt", width: 22 },
    { header: "更新时间", key: "updatedAt", width: 22 },
  ];

  rows.forEach((row, index) => {
    sheet.addRow({
      index: index + 1,
      gameName: row.gameName,
      choice: CHOICE_LABEL[row.choice],
      createdAt: formatDateTime(row.createdAt),
      updatedAt: formatDateTime(row.updatedAt),
    });
  });

  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2F554A" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.height = 24;
    row.font = { size: 11, color: { argb: "FF2B251F" } };
    row.alignment = { vertical: "middle" };
    const choiceCell = row.getCell("choice");
    if (rowNumber > 1) {
      choiceCell.font = {
        size: 11,
        bold: true,
        color: {
          argb: row.getCell("choice").value === "已报名" ? "FF2F554A" : "FF9A6A3D",
        },
      };
    }
    row.eachCell((cell) => {
      cell.border = thinBorder;
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
