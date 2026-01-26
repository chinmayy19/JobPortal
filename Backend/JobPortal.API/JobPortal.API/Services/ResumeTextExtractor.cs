using UglyToad.PdfPig;
using DocumentFormat.OpenXml.Packaging;
using System.Text;

namespace JobPortal.API.Services
{
    public class ResumeTextExtractor
    {
        public static string ExtractText(string filePath)
        {
            if (filePath.EndsWith(".pdf"))
            {
                var text = new StringBuilder();
                using var pdf = PdfDocument.Open(filePath);
                foreach (var page in pdf.GetPages())
                    text.Append(page.Text);

                return text.ToString();
            }

            if (filePath.EndsWith(".docx"))
            {
                using var doc = WordprocessingDocument.Open(filePath, false);
                return doc.MainDocumentPart.Document.Body.InnerText;
            }

            return string.Empty;
        }
    }
}
