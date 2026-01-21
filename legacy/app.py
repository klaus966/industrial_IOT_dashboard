import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import time
from datetime import datetime, timedelta

# --- Configuration ---
st.set_page_config(
    page_title="Industrial Monitor",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- Custom CSS (Light Mode) ---
st.markdown("""
<style>
    /* Global Background - Light Gray */
    .stApp {
        background-color: #f0f2f6; 
        color: #31333F;
    }
    
    /* Card Container Styling */
    .machine-card {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    /* Headers */
    h1, h2, h3, h4 {
        color: #1a1a1a !important;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Metric Labels */
    div[data-testid="stMetricLabel"] {
        color: #666;
        font-size: 0.9em;
    }
    
    /* Machine Title in Card */
    .card-title {
        font-size: 1.5em;
        font-weight: 600;
        margin-bottom: 15px;
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
        display: inline-block;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #ffffff;
        border-right: 1px solid #ddd;
    }
    
    /* Force Sidebar Text Dark */
    section[data-testid="stSidebar"] .stMarkdown, 
    section[data-testid="stSidebar"] .stSelectbox label, 
    section[data-testid="stSidebar"] .stSlider label,
    section[data-testid="stSidebar"] p,
    section[data-testid="stSidebar"] span {
        color: #31333F !important;
    }
</style>
""", unsafe_allow_html=True)

# --- Data Simulation ---
@st.cache_data
def get_machines():
    return [f"Machine-{i}" for i in range(1, 6)]

def generate_sensor_data(num_points=1, prev_data=None):
    """Simulates realistic sensor data including Health and OEE."""
    now = datetime.now()
    
    # Random walk for some realism
    if prev_data is None:
        temp = np.random.uniform(60, 90)
        speed = np.random.uniform(1000, 3000)
        health = 95.0
        oee = 85.0
        production = 1000
    else:
        temp = prev_data['Temperature'] + np.random.uniform(-1, 1)
        speed = max(0, prev_data['Speed'] + np.random.uniform(-50, 50))
        # Health slowly degrades, jumps up randomly (maintenance)
        health = prev_data['Health'] - np.random.uniform(0, 0.1)
        if np.random.random() > 0.99: health = 100.0
        health = max(0, min(100, health))
        
        oee = prev_data['OEE'] + np.random.uniform(-0.5, 0.5)
        oee = max(0, min(100, oee))
        
        production = prev_data['Production'] + int(np.random.uniform(0, 5))

    return {
        "Temperature": temp,
        "Speed": speed,
        "Health": health,
        "OEE": oee,
        "Production": production,
        "Timestamp": now
    }

# --- Session State for Persistent Data ---
if 'history' not in st.session_state:
    machines = get_machines()
    st.session_state['history'] = {m: pd.DataFrame(columns=["Timestamp", "Temperature", "Speed", "Health", "OEE", "Production"]) for m in machines}
    # Pre-fill with some data
    for m in machines:
        last_data = None
        rows = []
        for i in range(60): # 60 seconds of history
             data = generate_sensor_data(prev_data=last_data)
             data["Timestamp"] = datetime.now() - timedelta(seconds=60-i)
             rows.append(data)
             last_data = data
        st.session_state['history'][m] = pd.concat([st.session_state['history'][m], pd.DataFrame(rows)], ignore_index=True)


# --- Sidebar ---
st.sidebar.title("🎛️ Control Panel")

all_machines = get_machines()
selected_machines = st.sidebar.multiselect(
    "Monitor Machines",
    all_machines,
    default=all_machines[:3]
)

refresh_rate = st.sidebar.slider("Refresh Rate (s)", 0.5, 5.0, 1.0)
st.sidebar.markdown("---")
st.sidebar.info("Select machines to view their live dashboard blocks.")

# --- Main Dashboard Loop ---

placeholder = st.empty()
run_live = st.sidebar.checkbox("Start Live Monitoring", value=True)

if run_live:
    while True:
        # 1. Update Data
        for m in all_machines:
            last_entry = st.session_state['history'][m].iloc[-1]
            new_data = generate_sensor_data(prev_data=last_entry)
            new_row = pd.DataFrame([new_data])
            st.session_state['history'][m] = pd.concat([st.session_state['history'][m], new_row], ignore_index=True)
            if len(st.session_state['history'][m]) > 100:
                st.session_state['history'][m] = st.session_state['history'][m].iloc[-100:]

        # 2. Render UI
        with placeholder.container():
            st.title("🏭 Plant Performance Monitor")
            
            if not selected_machines:
                st.warning("No machines selected.")
            
            for m in selected_machines:
                # Get latest data
                data = st.session_state['history'][m].iloc[-1]
                history = st.session_state['history'][m]
                
                # Card Container
                with st.container():
                    st.markdown(f"""
                    <div class="machine-card">
                        <div class="card-title">{m}</div>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Layout: Left (Metrics) | Right (Chart)
                    col1, col2 = st.columns([1, 3])
                    
                    with col1:
                        st.markdown("##### Machine Status")
                        
                        # Custom Health Bar
                        health_val = int(data['Health'])
                        color = "green" if health_val > 70 else "orange" if health_val > 40 else "red"
                        st.markdown(f"""
                        <div style="margin-bottom:10px;">
                            <label>Machine Health</label>
                            <div style="background-color: #eee; border-radius: 5px; height: 25px; width: 100%;">
                                <div style="background-color: {color}; width: {health_val}%; height: 100%; border-radius: 5px; text-align: center; color: white; lign-height: 25px; font-weight: bold;">
                                    {health_val}%
                                </div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)

                        st.metric("OEE", f"{data['OEE']:.1f}%")
                        st.metric("Production Count", f"{int(data['Production'])}")
                        
                        if data['Temperature'] > 85:
                            st.error(f"🔥 Overheating: {data['Temperature']:.1f}°C")
                    
                    with col2:
                        # Chart
                        # Use Plotly white theme
                        fig = px.area(
                            history, 
                            x="Timestamp", 
                            y=["Speed", "Temperature"],
                            template="plotly_white",
                            height=300,
                            color_discrete_sequence=['#3498db', '#e74c3c'] 
                        )
                        fig.update_layout(
                            margin=dict(l=0, r=0, t=20, b=0),
                            legend=dict(orientation="h", y=1.1),
                            xaxis_title=None,
                            yaxis_title=None
                        )
                        st.plotly_chart(fig, use_container_width=True)
                    
                    st.markdown("---") # Separator between machines

        time.sleep(refresh_rate)
