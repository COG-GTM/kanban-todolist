        // ==========================================
        // ARCHITECTURAL TIME & DATE PARSING CONVERSIONS
        // ==========================================
        function formatRelativeTime(timestamp) {
            if (!timestamp) return 'Never';
            const diff = Date.now() - timestamp;
            const mins = Math.floor(diff / 60000);
            
            if (mins < 1) return 'just now';
            if (mins < 60) return `${mins}m ago`;
            
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours}h ago`;
            
            const days = Math.floor(hours / 24);
            if (days === 1) return 'yesterday';
            
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        function formatFullTime(timestamp) {
            if (!timestamp) return 'Never edited';
            const date = new Date(timestamp);
            return date.toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
