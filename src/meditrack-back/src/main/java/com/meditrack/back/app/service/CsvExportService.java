package com.meditrack.back.app.service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.function.Function;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

@Service
public class CsvExportService {

    // BOM UTF-8: ayuda a Excel a leer bien acentos/ñ
    private static final byte[] UTF8_BOM = new byte[] {(byte)0xEF, (byte)0xBB, (byte)0xBF};

    public <T> byte[] exportToCsv(
            List<T> rows,
            LinkedHashMap<String, Function<T, Object>> columns,
            char delimiter
    ) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            baos.write(UTF8_BOM);

            OutputStreamWriter writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8);

            CSVFormat format = CSVFormat.DEFAULT
                    .builder()
                    .setDelimiter(delimiter)
                    .setHeader(columns.keySet().toArray(String[]::new))
                    .build();

            try (CSVPrinter printer = new CSVPrinter(writer, format)) {
                for (T row : rows) {
                    for (Function<T, Object> extractor : columns.values()) {
                        Object val = extractor.apply(row);
                        printer.print(val == null ? "" : val);
                    }
                    printer.println();
                }
                printer.flush();
            }

            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando CSV: " + e.getMessage(), e);
        }
    }
}