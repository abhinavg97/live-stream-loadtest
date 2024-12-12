from locust import HttpUser, task, between


class VideoStreamUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def load_video(self):
        # Request the HLS .m3u8 file
        response = self.client.get("/stream")
        # Simulate browser requesting HLS segments by parsing m3u8 file
        m3u8_content = response.text
        segments = [line for line in m3u8_content.splitlines() if line.endswith('.ts')]
        for segment in segments:
            self.client.get(f"{segment}")

# Usage: locust -f this_file.py --host=http://localhost:8002
