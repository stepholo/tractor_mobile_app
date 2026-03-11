# **App Name**: Tractor Ledger Pro

## Core Features:

- Daily Operation Logging: Capture comprehensive daily tractor operation details including fuel, labor, repair costs, implement used, acres completed, and current engine hours. The system automatically calculates total deductions, net profit, cost per acre, profit per acre, and fuel cost per acre for each entry.
- Tractor Service Management: Configure tractor service parameters (last service type and engine hours). The app tracks engine hours, triggers service alerts every 50 hours, and determines the next required service type (Minor, Major, Annual) in rotation.
- Operations Dashboard: Provides an at-a-glance overview of total acres completed, revenue, expenses, net profit, average profit per acre, average fuel cost per acre, and total engine hours worked. It also summarizes profit and acres by implement used and lists recent operation records.
- Record Management: Users can view, edit, or delete any past daily operation records to correct inaccuracies or remove outdated entries.
- Offline Local Storage: All operation and service data is securely stored directly on the user's device using local browser storage (like IndexedDB for a PWA), ensuring full functionality and data access without requiring an internet connection.
- Excel Data Export: Export all recorded operational data into a structured .xlsx spreadsheet file, downloadable to the device for detailed analysis or backup purposes.

## Style Guidelines:

- The visual design emphasizes efficiency and reliability with a clean aesthetic. A primary color of strong orange (#FF7F00) provides energy and highlights key interactive elements. This is contrasted with a clean white background (#FFFFFF) for readability and a sophisticated black (#000000) for text and important accents, creating a high-contrast and modern interface.
- The typeface 'Inter' (sans-serif) is chosen for its modern, neutral, and objective characteristics, ensuring exceptional clarity and readability across all data fields, labels, and dashboard elements. Its versatility allows it to serve effectively for both headlines and body text, promoting a streamlined user experience.
- Utilize simple, easily recognizable line icons for key actions like 'Add', 'Edit', 'Delete', and 'Export', maintaining a functional and uncluttered interface. Icons related to agricultural operations should be abstract and minimalist for quick comprehension.
- Prioritize a clean, mobile-optimized layout with large, touch-friendly input fields for quick data entry in field conditions. Dashboard elements are clearly separated with sufficient white space to avoid visual clutter, presenting information in an easily digestible hierarchy.
- Implement subtle and quick animations for user feedback, such as confirmation on record saving, smooth transitions between screens, or clear visual cues for service alerts, enhancing the sense of responsiveness without distracting the user.