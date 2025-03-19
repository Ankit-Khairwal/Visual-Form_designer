# Visual Form Designer

A drag-and-drop form designer built with Vanilla JavaScript that allows users to create, edit, reorder, and delete form elements.

## Features

- **Add Form Elements**: Add inputs, selects, textareas, and checkboxes
- **Edit Elements**: Edit labels and placeholders (for inputs and textareas), add/remove options for select elements
- **Reorder Elements**: Drag and drop elements to reorder them
- **Delete Elements**: Remove any element from the form
- **Save Form**: Save the form design as JSON (output to console)

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- [SortableJS](https://github.com/SortableJS/Sortable) for drag-and-drop functionality

## Getting Started

### Local Development

1. Clone the repository:
   ```
   git clone [your-repository-url]
   ```

2. Navigate to the project directory:
   ```
   cd Visual-Form_designer
   ```

3. Open `index.html` in your browser:
   - You can use a local server like [Live Server](https://visual-form-designer.vercel.app/) 
   - Or simply open the HTML file in your browser

### Usage

1. Use the buttons in the toolbox to add new form elements
2. Drag and drop elements to reorder them
3. Click the "Edit" button on any element to modify its properties
4. For select elements, you can add and remove options in the edit modal
5. Click the "Save Form" button to output the form design as JSON in the console

## JSON Format

The form data is saved in the following JSON format:

```json
[
  {
    "id": "unique-id",
    "type": "input",
    "label": "Input Label",
    "placeholder": "Input Placeholder"
  },
  {
    "id": "unique-id",
    "type": "select",
    "label": "Select Label",
    "options": ["Option 1", "Option 2", "Option 3"]
  },
  {
    "id": "unique-id",
    "type": "textarea",
    "label": "Textarea Label",
    "placeholder": "Textarea Placeholder"
  },
  {
    "id": "unique-id",
    "type": "checkbox",
    "label": "Checkbox Label"
  }
]
```

## License

This project is licensed under the MIT License. 
