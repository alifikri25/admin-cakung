import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '../contexts/ThemeContext';

export default function MarkdownEditor({ value, onChange }) {
    const { theme } = useTheme();

    return (
        <div data-color-mode={theme}>
            <MDEditor
                value={value}
                onChange={onChange}
                height={400}
                preview="live"
                hideToolbar={false}
            />
        </div>
    );
}
